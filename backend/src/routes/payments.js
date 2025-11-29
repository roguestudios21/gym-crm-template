const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// Get all payments
router.get('/', async (req, res) => {
    try {
        const { memberID, startDate, endDate, paymentMode, limit = 50, skip = 0 } = req.query;

        let query = {};
        if (memberID) query.memberID = memberID;
        if (paymentMode) query.paymentMode = paymentMode;

        if (startDate || endDate) {
            query.paymentDate = {};
            if (startDate) query.paymentDate.$gte = new Date(startDate);
            if (endDate) query.paymentDate.$lte = new Date(endDate);
        }

        const payments = await Payment.find(query)
            .populate('memberID', 'name contact1 email')
            .populate('invoiceID', 'invoiceNumber')
            .populate('receivedBy', 'name')
            .sort({ paymentDate: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Payment.countDocuments(query);

        res.json({
            payments,
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

// Get specific payment
router.get('/:id', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('memberID', 'name contact1 email address')
            .populate('invoiceID')
            .populate('receivedBy', 'name');

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create payment (manual entry)
router.post('/', async (req, res) => {
    try {
        const { invoiceID, memberID, amount, paymentMode, transactionID, receivedBy, notes } = req.body;

        // Verify invoice exists
        const invoice = await Invoice.findById(invoiceID);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (amount > invoice.balanceAmount) {
            return res.status(400).json({ error: 'Payment amount exceeds invoice balance' });
        }

        const payment = new Payment({
            invoiceID,
            memberID,
            amount,
            paymentMode,
            transactionID,
            receivedBy,
            notes
        });

        await payment.save();

        // Update invoice
        invoice.paidAmount += amount;
        invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount;
        invoice.paymentHistory.push({
            paymentID: payment._id,
            amount,
            date: payment.paymentDate,
            mode: paymentMode,
            transactionID,
            staffID: receivedBy
        });

        await invoice.save();

        res.status(201).json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get payments for a member
router.get('/member/:memberID', async (req, res) => {
    try {
        const payments = await Payment.find({ memberID: req.params.memberID })
            .populate('invoiceID', 'invoiceNumber')
            .sort({ paymentDate: -1 });

        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

        res.json({
            payments,
            totalPaid
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark receipt as generated
router.put('/:id/receipt-generated', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        payment.receiptGenerated = true;
        await payment.save();

        res.json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
