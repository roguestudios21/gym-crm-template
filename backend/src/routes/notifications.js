const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Member = require('../models/Member');

// Send notification
router.post('/send', async (req, res) => {
    try {
        const { recipientType, recipientID, type, subject, message, template, context, scheduledFor, createdBy } = req.body;

        const notification = new Notification({
            recipientType,
            recipientID,
            type,
            subject,
            message,
            template,
            context,
            scheduledFor,
            createdBy,
            trigger: 'manual',
            status: scheduledFor ? 'scheduled' : 'pending'
        });

        await notification.save();

        // TODO: Implement actual sending logic here
        // For now, just mark as sent if immediate
        if (!scheduledFor) {
            notification.status = 'sent';
            notification.sentAt = new Date();
            await notification.save();
        }

        res.status(201).json({
            message: 'Notification queued successfully',
            notification
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk send notifications
router.post('/bulk-send', async (req, res) => {
    try {
        const { recipientIDs, type, subject, message, template, context, createdBy } = req.body;

        if (!recipientIDs || recipientIDs.length === 0) {
            return res.status(400).json({ error: 'No recipients specified' });
        }

        const notifications = recipientIDs.map(recipientID => ({
            recipientType: 'member', // Can be made dynamic
            recipientID,
            type,
            subject,
            message,
            template,
            context,
            createdBy,
            trigger: 'manual',
            status: 'pending'
        }));

        const created = await Notification.insertMany(notifications);

        // TODO: Implement actual sending logic

        res.status(201).json({
            message: `${created.length} notifications queued successfully`,
            count: created.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get notification history
router.get('/history', async (req, res) => {
    try {
        const { status, type, recipientID, startDate, endDate, limit = 50, skip = 0 } = req.query;

        let query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (recipientID) query.recipientID = recipientID;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Notification.countDocuments(query);

        res.json({
            notifications,
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

// Get specific notification
router.get('/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get pending notifications (for processing)
router.get('/pending/list', async (req, res) => {
    try {
        const pending = await Notification.find({
            status: 'pending',
            $or: [
                { scheduledFor: null },
                { scheduledFor: { $lte: new Date() } }
            ]
        })
            .sort({ createdAt: 1 })
            .limit(100);

        res.json(pending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark notification as sent
router.put('/:id/mark-sent', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        notification.status = 'sent';
        notification.sentAt = new Date();
        await notification.save();

        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark notification as failed
router.put('/:id/mark-failed', async (req, res) => {
    try {
        const { errorMessage } = req.body;
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        notification.status = 'failed';
        notification.errorMessage = errorMessage;
        await notification.save();

        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
