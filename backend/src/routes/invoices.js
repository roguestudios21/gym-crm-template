const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Member = require('../models/Member');

// Get all invoices
router.get('/', async (req, res) => {
    try {
        const { status, memberID, startDate, endDate, limit = 50, skip = 0 } = req.query;

        let query = {};
        if (status) query.status = status;
        if (memberID) query.memberID = memberID;

        if (startDate || endDate) {
            query.invoiceDate = {};
            if (startDate) query.invoiceDate.$gte = new Date(startDate);
            if (endDate) query.invoiceDate.$lte = new Date(endDate);
        }

        const invoices = await Invoice.find(query)
            .populate('memberID', 'name contact1 email')
            .populate('createdBy', 'name')
            .sort({ invoiceDate: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Invoice.countDocuments(query);

        res.json({
            invoices,
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

// Get specific invoice
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('memberID', 'name contact1 email address')
            .populate('createdBy', 'name')
            .populate('items.planID', 'name');

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create invoice
router.post('/', async (req, res) => {
    try {
        const { memberID, items, dueDate, notes, taxRate, discount, createdBy } = req.body;

        // Calculate amounts
        let subtotal = 0;
        const processedItems = items.map(item => {
            const amount = item.quantity * item.unitPrice;
            subtotal += amount;
            return { ...item, amount };
        });

        const tax = subtotal * (taxRate || 0) / 100;
        const totalAmount = subtotal + tax - (discount || 0);

        const invoice = new Invoice({
            memberID,
            items: processedItems,
            dueDate,
            notes,
            taxRate: taxRate || 0,
            discount: discount || 0,
            subtotal,
            tax,
            totalAmount,
            paidAmount: 0,
            balanceAmount: totalAmount,
            status: 'pending',
            createdBy
        });

        await invoice.save();

        res.status(201).json(invoice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update invoice
router.put('/:id', async (req, res) => {
    try {
        const { items, dueDate, notes, taxRate, discount, status } = req.body;

        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (invoice.status === 'paid') {
            return res.status(400).json({ error: 'Cannot modify paid invoice' });
        }

        if (items) {
            let subtotal = 0;
            const processedItems = items.map(item => {
                const amount = item.quantity * item.unitPrice;
                subtotal += amount;
                return { ...item, amount };
            });

            invoice.items = processedItems;
            invoice.subtotal = subtotal;
            invoice.tax = subtotal * (taxRate || invoice.taxRate) / 100;
            invoice.totalAmount = invoice.subtotal + invoice.tax - (discount || invoice.discount);
            invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount;
        }

        if (dueDate) invoice.dueDate = dueDate;
        if (notes) invoice.notes = notes;
        if (taxRate !== undefined) invoice.taxRate = taxRate;
        if (discount !== undefined) invoice.discount = discount;
        if (status) invoice.status = status;

        await invoice.save();

        res.json(invoice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Record payment against invoice
router.post('/:id/record-payment', async (req, res) => {
    try {
        const { amount, paymentMode, transactionID, receivedBy, notes } = req.body;

        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (amount > invoice.balanceAmount) {
            return res.status(400).json({ error: 'Payment amount exceeds balance' });
        }

        // Create payment record
        const payment = new Payment({
            invoiceID: invoice._id,
            memberID: invoice.memberID,
            amount,
            paymentMode,
            transactionID,
            receivedBy,
            notes,
            receiptGenerated: false
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

        res.json({
            message: 'Payment recorded successfully',
            invoice,
            payment
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete invoice (only drafts)
router.delete('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (invoice.status !== 'draft' && invoice.paidAmount > 0) {
            return res.status(400).json({ error: 'Cannot delete invoice with payments' });
        }

        await Invoice.findByIdAndDelete(req.params.id);

        res.json({ message: 'Invoice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get invoices for a member
router.get('/member/:memberID', async (req, res) => {
    try {
        const invoices = await Invoice.find({ memberID: req.params.memberID })
            .sort({ invoiceDate: -1 });

        const totalOutstanding = invoices
            .filter(inv => inv.balanceAmount > 0)
            .reduce((sum, inv) => sum + inv.balanceAmount, 0);

        res.json({
            invoices,
            totalOutstanding
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
