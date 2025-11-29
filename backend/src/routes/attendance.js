const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');

// Biometric check-in
router.post('/checkin', async (req, res) => {
    try {
        const { biometricHash, deviceID, memberID, timestamp } = req.body;

        let member;

        // If memberID provided (manual override)
        if (memberID) {
            member = await Member.findById(memberID);
        } else if (biometricHash) {
            // Find member by biometric template
            member = await Member.findOne({
                'biometricData.fingerprintTemplates': biometricHash,
                'biometricData.isEnrolled': true
            });
        }

        if (!member) {
            return res.status(404).json({ error: 'Member not found or biometric not enrolled' });
        }

        // Check if member is active
        if (member.status !== 'active') {
            return res.status(403).json({
                error: 'Member is not active',
                status: member.status,
                memberName: member.name
            });
        }

        // Check for existing check-in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingCheckIn = await Attendance.findOne({
            memberID: member._id,
            date: today,
            status: 'checked-in'
        });

        if (existingCheckIn) {
            return res.status(400).json({
                error: 'Member already checked in',
                checkInTime: existingCheckIn.checkInTime
            });
        }

        // Create attendance record
        const attendance = new Attendance({
            memberID: member._id,
            checkInTime: timestamp || new Date(),
            date: today,
            method: biometricHash ? 'biometric' : 'manual',
            deviceID,
            biometricTemplateHash: biometricHash,
            status: 'checked-in'
        });

        await attendance.save();

        res.status(201).json({
            message: 'Check-in successful',
            memberName: member.name,
            memberID: member.memberID,
            checkInTime: attendance.checkInTime,
            attendance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check-out
router.post('/checkout', async (req, res) => {
    try {
        const { memberID, timestamp } = req.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            memberID,
            date: today,
            status: 'checked-in'
        });

        if (!attendance) {
            return res.status(404).json({ error: 'No active check-in found for today' });
        }

        attendance.checkOutTime = timestamp || new Date();
        attendance.status = 'checked-out';
        attendance.calculateDuration();

        await attendance.save();

        const member = await Member.findById(memberID);

        res.json({
            message: 'Check-out successful',
            memberName: member?.name,
            duration: attendance.duration,
            attendance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get current attendance (who's in the gym now)
router.get('/current', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentAttendance = await Attendance.find({
            date: today,
            status: 'checked-in'
        })
            .populate('memberID', 'name memberID contact1 profilePicture')
            .sort({ checkInTime: -1 });

        res.json({
            count: currentAttendance.length,
            members: currentAttendance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get attendance history for a member
router.get('/member/:memberID', async (req, res) => {
    try {
        const { startDate, endDate, limit = 50 } = req.query;

        let query = { memberID: req.params.memberID };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const attendance = await Attendance.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit));

        res.json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get attendance statistics
router.get('/stats', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let matchStage = {};
        if (startDate || endDate) {
            matchStage.date = {};
            if (startDate) matchStage.date.$gte = new Date(startDate);
            if (endDate) matchStage.date.$lte = new Date(endDate);
        }

        // Total visits
        const totalVisits = await Attendance.countDocuments(matchStage);

        // Average duration
        const durationStats = await Attendance.aggregate([
            { $match: { ...matchStage, duration: { $exists: true, $gt: 0 } } },
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: '$duration' },
                    maxDuration: { $max: '$duration' },
                    minDuration: { $min: '$duration' }
                }
            }
        ]);

        // Peak hours
        const peakHours = await Attendance.aggregate([
            { $match: matchStage },
            {
                $project: {
                    hour: { $hour: '$checkInTime' }
                }
            },
            {
                $group: {
                    _id: '$hour',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            totalVisits,
            averageDuration: durationStats[0]?.avgDuration || 0,
            peakHours
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all attendance records (admin)
router.get('/', async (req, res) => {
    try {
        const { date, status, limit = 100, skip = 0 } = req.query;

        let query = {};
        if (date) query.date = new Date(date);
        if (status) query.status = status;

        const attendance = await Attendance.find(query)
            .populate('memberID', 'name memberID contact1')
            .sort({ checkInTime: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Attendance.countDocuments(query);

        res.json({
            attendance,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip),
                hasMore: skip + limit < total
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
