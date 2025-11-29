const express = require("express");
const router = express.Router();
const Sales = require("../models/Sales");

// LIST ALL SALES
router.get("/", async (req, res) => {
  try {
    const sales = await Sales.find().populate("memberID", "name").populate("product", "name").populate("staff", "name");
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Member = require("../models/Member");
const Product = require("../models/Product");

// ADD SALE (Integrated with Invoice & Payment)
router.post("/add", async (req, res) => {
  try {
    const { memberID, product, amount, staff, paymentMode, description } = req.body;

    // 1. Create Sale Record
    const sale = new Sales(req.body);
    await sale.save();

    // 2. Create Invoice
    // Generate Invoice Number (Simple logic for now)
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const invoice = new Invoice({
      invoiceNumber,
      memberID,
      issueDate: new Date(),
      dueDate: new Date(), // Due immediately
      items: [{
        description: description || "Sale Item", // Ideally fetch product name
        quantity: 1,
        unitPrice: amount,
        total: amount
      }],
      totalAmount: amount,
      status: 'paid', // Since it's a POS sale
      notes: `Auto-generated from Sale #${sale._id}`
    });
    await invoice.save();

    // 3. Create Payment Record
    const payment = new Payment({
      invoiceID: invoice._id,
      memberID,
      amount,
      paymentMode: paymentMode || 'Cash', // Corrected field name
      paymentDate: new Date(),
      // reference: `Sale #${sale._id}`, // Payment model doesn't have reference, maybe notes?
      notes: `Sale #${sale._id} - ${description || ''}`,
      receivedBy: staff
    });
    await payment.save();

    // 4. Update Member's Membership/Session Balance
    // Fetch product to know what to update
    const productDetails = await Product.findById(product);
    if (productDetails && memberID) {
      const member = await Member.findById(memberID);
      if (member) {
        if (productDetails.category === 'session_pack') {
          // Add sessions to balance
          if (productDetails.sessionCredits > 0) {
            // Assuming general credits for now, or specific type if defined
            // If sessionTypes are defined in pack, add those
            if (productDetails.sessionTypes && productDetails.sessionTypes.length > 0) {
              productDetails.sessionTypes.forEach(st => {
                member.addSessions(st.name, st.sessionsIncluded);
              });
            } else {
              // Fallback to general 'General' type or similar if no specific types
              member.addSessions('General', productDetails.sessionCredits);
            }
          }
        } else if (productDetails.category === 'membership') {
          // Update membership details (Legacy + New)
          member.membership.currentPlan = product;
          member.membership.startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + productDetails.duration);
          member.membership.endDate = endDate;
          member.membership.status = 'active';

          // Reset legacy sessions if applicable
          if (!productDetails.isUnlimited) {
            member.membership.sessionsRemaining = {
              total: productDetails.totalSessions,
              byType: productDetails.sessionTypes.map(st => ({
                sessionType: st.name,
                remaining: st.sessionsIncluded
              }))
            };
          }

          // Also update top-level dates for convenience
          member.startDate = new Date();
          member.endDate = endDate;
        }
        await member.save();
      }
    }

    res.json({ success: true, sale, invoice, payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE SALE
router.put("/update/:id", async (req, res) => {
  try {
    const sale = await Sales.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ success: true, sale });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE SALE
router.delete("/delete/:id", async (req, res) => {
  try {
    await Sales.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Sale Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FILTER SALES
router.post("/filter", async (req, res) => {
  try {
    const result = await Sales.find(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GENERATE SALES REPORT
router.get("/report", async (req, res) => {
  try {
    const data = await Sales.find();
    res.json({
      totalRevenue: data.reduce((acc, s) => acc + s.amount, 0),
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
