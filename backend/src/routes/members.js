const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const { memberValidation } = require('../middleware/validation');

// Configure multer for profile uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads/profiles'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

// Create member (with validation)
router.post('/', upload.single('profilePicture'), memberValidation, async (req, res) => {
  try {
    const {
      name, gender, DOB, contact1, contact2, email, address,
      emergencyName, emergencyNumber, status, subscription, plan
    } = req.body;

    // Auto-generate Member ID if not provided (Format: MEM + 6 random digits)
    const memberID = 'MEM' + Math.floor(100000 + Math.random() * 900000);

    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    let startDate = new Date();
    let endDate = null;

    if (plan) {
      const Product = require('../models/Product');
      const product = await Product.findById(plan);
      if (product) {
        endDate = new Date();
        endDate.setDate(endDate.getDate() + product.duration);
      }
    }

    const newMember = new Member({
      memberID,
      name,
      gender,
      DOB,
      profilePicture,
      contact1,
      contact2,
      email,
      address,
      emergencyName,
      emergencyNumber,
      status: status || 'active',
      subscription, // Keep for legacy or manual override
      plan,
      startDate,
      endDate,
      spaHistory: [],
      dietHistory: [],
      // Initialize membership object
      membership: {
        currentPlan: plan,
        startDate: startDate,
        endDate: endDate,
        status: 'active',
        autoRenew: false,
        history: plan ? [{
          planID: plan,
          startDate: startDate,
          endDate: endDate,
          amount: 0 // Initial creation might not have payment record here, or we could fetch price
        }] : []
      }
    });

    await newMember.save();

    res.json({ success: true, memberID: newMember.memberID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Read all members
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }
    const members = await Member.find(query).sort({ name: 1 }).populate('plan');
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get single member
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findOne({ memberID: req.params.id }).populate('plan');
    if (!member) return res.status(404).json({ error: 'Not found' });
    res.json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update profile (multipart optional)
router.put('/:id', upload.single('profilePicture'), async (req, res) => {
  try {
    const id = req.params.id;
    const member = await Member.findOne({ memberID: id });
    if (!member) return res.status(404).json({ error: 'Not found' });

    // Merge fields
    const updates = { ...req.body };
    if (req.file) updates.profilePicture = `/uploads/${req.file.filename}`;

    // Update fields
    Object.assign(member, updates);

    // Ensure spaHistory and dietHistory are arrays if provided
    if (updates.spaHistory && typeof updates.spaHistory === 'string') {
      try { member.spaHistory = JSON.parse(updates.spaHistory); } catch (e) { }
    }
    if (updates.dietHistory && typeof updates.dietHistory === 'string') {
      try { member.dietHistory = JSON.parse(updates.dietHistory); } catch (e) { }
    }

    // If plan is updated, recalculate dates
    if (updates.plan && updates.plan !== member.plan?.toString()) {
      const Product = require('../models/Product');
      const product = await Product.findById(updates.plan);
      if (product) {
        member.plan = updates.plan;
        member.startDate = new Date(); // Reset start date to now? Or keep original? Assuming new plan starts now.
        member.endDate = new Date();
        member.endDate.setDate(member.endDate.getDate() + product.duration);
      }
    }

    await member.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



// Add biometric (store as JSON with vendor + base64)
router.post('/:id/biometric', express.json(), async (req, res) => {
  try {
    const id = req.params.id;
    const { templateBase64, vendor } = req.body;
    if (!templateBase64) return res.status(400).json({ error: 'templateBase64 required' });

    const biometricData = { vendor: vendor || 'unknown', templateBase64 };

    await Member.findOneAndUpdate({ memberID: id }, { biometric: biometricData });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// NEW ENDPOINTS FOR MEMBERSHIP MANAGEMENT

// Renew membership
router.post('/:id/renew', async (req, res) => {
  try {
    const { planID, autoRenew } = req.body;
    const member = await Member.findById(req.params.id).populate('membership.currentPlan');

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const Product = require('../models/Product');
    const plan = await Product.findById(planID);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Calculate new dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // Initialize sessions if plan has session types
    const sessionsRemaining = {
      total: plan.totalSessions || 0,
      byType: []
    };

    if (plan.sessionTypes && plan.sessionTypes.length > 0) {
      sessionsRemaining.byType = plan.sessionTypes.map(st => ({
        sessionType: st.name,
        remaining: st.sessionsIncluded || 0
      }));

      // Calculate total if not specified
      if (!plan.totalSessions) {
        sessionsRemaining.total = plan.sessionTypes.reduce((sum, st) => sum + (st.sessionsIncluded || 0), 0);
      }
    }

    // Update membership history
    if (!member.membership) {
      member.membership = {};
    }

    if (!member.membership.history) {
      member.membership.history = [];
    }

    if (member.membership.currentPlan) {
      member.membership.history.push({
        planID: member.membership.currentPlan,
        startDate: member.membership.startDate,
        endDate: member.membership.endDate,
        amount: plan.price
      });
    }

    // Update membership
    member.membership.currentPlan = planID;
    member.membership.startDate = startDate;
    member.membership.endDate = endDate;
    member.membership.status = 'active';
    member.membership.autoRenew = autoRenew || false;
    member.membership.sessionsRemaining = sessionsRemaining;
    member.membership.renewalSettings = member.membership.renewalSettings || {};
    member.membership.renewalSettings.notificationSent = false;

    // Update legacy fields for backward compatibility
    member.plan = planID;
    member.startDate = startDate;
    member.endDate = endDate;
    member.status = 'active';

    await member.save();

    res.json({
      message: 'Membership renewed successfully',
      membership: member.membership
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Freeze membership
router.post('/:id/freeze', async (req, res) => {
  try {
    const { startDate, endDate, reason, approvedBy } = req.body;
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (!member.membership) {
      return res.status(400).json({ error: 'No active membership to freeze' });
    }

    const freezeStart = new Date(startDate);
    const freezeEnd = new Date(endDate);
    const freezeDuration = Math.ceil((freezeEnd - freezeStart) / (1000 * 60 * 60 * 24));

    // Add to freeze history
    if (!member.membership.freezeHistory) {
      member.membership.freezeHistory = [];
    }

    member.membership.freezeHistory.push({
      startDate: freezeStart,
      endDate: freezeEnd,
      reason,
      approvedBy
    });

    member.membership.currentlyFrozen = true;
    member.membership.status = 'frozen';
    member.status = 'frozen';

    // Extend membership end date by freeze duration
    if (member.membership.endDate) {
      const newEndDate = new Date(member.membership.endDate);
      newEndDate.setDate(newEndDate.getDate() + freezeDuration);
      member.membership.endDate = newEndDate;
      member.endDate = newEndDate;
    }

    await member.save();

    res.json({
      message: 'Membership frozen successfully',
      freezeDuration,
      newEndDate: member.membership.endDate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unfreeze membership
router.post('/:id/unfreeze', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (!member.membership || !member.membership.currentlyFrozen) {
      return res.status(400).json({ error: 'Membership is not frozen' });
    }

    member.membership.currentlyFrozen = false;
    member.membership.status = 'active';
    member.status = 'active';

    await member.save();

    res.json({
      message: 'Membership unfrozen successfully',
      membership: member.membership
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get expiring memberships
router.get('/expiring/list', async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const expiringMembers = await Member.find({
      'membership.endDate': {
        $gte: new Date(),
        $lte: futureDate
      },
      'membership.status': 'active'
    })
      .populate('membership.currentPlan')
      .sort({ 'membership.endDate': 1 });

    const membersWithDays = expiringMembers.map(member => ({
      ...member.toObject(),
      daysRemaining: member.getDaysRemaining()
    }));

    res.json(membersWithDays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get expired memberships
router.get('/expired/list', async (req, res) => {
  try {
    const expiredMembers = await Member.find({
      'membership.endDate': { $lt: new Date() },
      'membership.status': { $ne: 'frozen' }
    })
      .populate('membership.currentPlan')
      .sort({ 'membership.endDate': -1 });

    res.json(expiredMembers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enroll biometric
router.post('/:id/enroll-biometric', async (req, res) => {
  try {
    const { fingerprintTemplate, deviceID } = req.body;
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (!member.biometricData) {
      member.biometricData = {
        fingerprintTemplates: [],
        deviceIDs: [],
        isEnrolled: false
      };
    }

    // Add template if not already exists
    if (!member.biometricData.fingerprintTemplates.includes(fingerprintTemplate)) {
      member.biometricData.fingerprintTemplates.push(fingerprintTemplate);
    }

    if (deviceID && !member.biometricData.deviceIDs.includes(deviceID)) {
      member.biometricData.deviceIDs.push(deviceID);
    }

    member.biometricData.enrollmentDate = new Date();
    member.biometricData.isEnrolled = true;

    await member.save();

    res.json({
      message: 'Biometric enrolled successfully',
      isEnrolled: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE MEMBER
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Check for orphaned references
    const Invoice = require('../models/Invoice');
    const Payment = require('../models/Payment');

    const invoiceCount = await Invoice.countDocuments({ memberID: id });
    const paymentCount = await Payment.countDocuments({ memberID: id });

    if (invoiceCount > 0 || paymentCount > 0) {
      return res.status(400).json({
        error: `Cannot delete member with existing records (${invoiceCount} invoices, ${paymentCount} payments). Consider marking as inactive instead.`
      });
    }

    await Member.findByIdAndDelete(id);
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get member outstanding balance
router.get('/:id/outstanding', async (req, res) => {
  try {
    const Invoice = require('../models/Invoice');

    const invoices = await Invoice.find({
      memberID: req.params.id,
      balanceAmount: { $gt: 0 }
    });

    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);

    res.json({
      totalOutstanding,
      invoices
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
