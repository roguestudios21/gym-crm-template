const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Member = require('../models/Member');
const Product = require('../models/Product');

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, memberID, staffID, sessionType, status } = req.query;

    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (memberID) query.memberID = memberID;
    if (staffID) query.staffID = staffID;
    if (sessionType) query['sessionType.name'] = sessionType;
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('memberID', 'name contact1 email')
      .populate('staffID', 'name')
      .populate('sessionType.planID', 'name')
      .sort({ date: -1, time: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available sessions for a member
router.get('/available-sessions/:memberID', async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberID)
      .populate('membership.currentPlan');

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Combine legacy sessions and new sessionBalance
    const availableSessions = [];

    // 1. Add from Universal Session Balance
    if (member.sessionBalance && member.sessionBalance.length > 0) {
      member.sessionBalance.forEach(s => {
        if (s.balance > 0) {
          availableSessions.push({ name: s.sessionType, balance: s.balance });
        }
      });
    }

    // 2. Add from Legacy Membership (if any)
    if (member.membership && member.membership.sessionsRemaining && member.membership.sessionsRemaining.byType) {
      member.membership.sessionsRemaining.byType.forEach(s => {
        if (s.remaining > 0) {
          // Check if already added, if so, sum up (or handle as duplicate)
          const existing = availableSessions.find(as => as.name === s.sessionType);
          if (existing) {
            existing.balance += s.remaining;
          } else {
            availableSessions.push({ name: s.sessionType, balance: s.remaining });
          }
        }
      });
    }

    res.json({
      sessionTypes: availableSessions,
      // Legacy fields for compatibility if needed, but UI should prefer sessionTypes array above
      remaining: { total: availableSessions.reduce((acc, s) => acc + s.balance, 0) },
      planName: member.membership?.currentPlan?.name || 'No Active Plan',
      isUnlimited: member.membership?.currentPlan?.isUnlimited || false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointments grouped by session type
router.get('/by-session-type', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const pipeline = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $group: {
          _id: '$sessionType.name',
          count: { $sum: 1 },
          appointments: { $push: '$$ROOT' }
        }
      },
      { $sort: { count: -1 } }
    );

    const result = await Appointment.aggregate(pipeline);

    const totalAppointments = result.reduce((sum, group) => sum + group.count, 0);

    res.json({
      totalAppointments,
      bySessionType: result.map(r => ({
        sessionType: r._id || 'General',
        count: r.count
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create appointment with session consumption
router.post('/add', async (req, res) => {
  try {
    const { memberID, date, time, sessionType, staffID, notes } = req.body;

    // Get member details
    const member = await Member.findById(memberID).populate('membership.currentPlan');

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Create appointment data
    const appointmentData = {
      memberID,
      date,
      time,
      staffID,
      notes,
      status: 'scheduled'
    };

    // If session type is provided, validate and track it
    if (sessionType && sessionType.name) {
      appointmentData.sessionType = sessionType;
      appointmentData.type = sessionType.name; // For backward compatibility

      // Check if member has sessions remaining (if not unlimited)
      if (member.membership && member.membership.currentPlan) {
        const plan = member.membership.currentPlan;

        if (!plan.isUnlimited) {
          const sessionsRemaining = member.membership.sessionsRemaining;

          if (sessionsRemaining && sessionsRemaining.total > 0) {
            appointmentData.memberSessionsRemaining = sessionsRemaining.total;
            appointmentData.sessionConsumed = false; // Will be marked consumed when completed
          } else if (sessionsRemaining && sessionsRemaining.total === 0) {
            return res.status(400).json({
              error: 'No sessions remaining in membership plan',
              remaining: sessionsRemaining
            });
          }
        }
      }
    }

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status to completed and consume session
router.put('/:id/complete', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.status = 'completed';
    appointment.completedAt = new Date();

    // Consume session if not already consumed
    if (!appointment.sessionConsumed && appointment.sessionType && appointment.sessionType.name) {
      const member = await Member.findById(appointment.memberID);

      if (member && member.membership) {
        member.consumeSession(appointment.sessionType.name);
        await member.save();

        appointment.sessionConsumed = true;
      }
    }

    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment (reschedule)
router.put('/:id', async (req, res) => {
  try {
    const { date, time, staffID, notes, status, cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (staffID) appointment.staffID = staffID;
    if (notes) appointment.notes = notes;
    if (status) appointment.status = status;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;

    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
