const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    memberID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    dueDate: Date,

    items: [{
        description: String,                 // "Monthly Membership - Basic Plan"
        quantity: {
            type: Number,
            default: 1
        },
        unitPrice: Number,
        amount: Number,                      // quantity * unitPrice
        planID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        _id: false
    }],

    subtotal: Number,
    tax: {
        type: Number,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 0                           // Percentage (e.g., 18 for 18% GST)
    },
    discount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },

    paidAmount: {
        type: Number,
        default: 0
    },
    balanceAmount: Number,                   // totalAmount - paidAmount

    status: {
        type: String,
        enum: ['draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled'],
        default: 'pending'
    },

    paymentHistory: [{
        paymentID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment'
        },
        amount: Number,
        date: Date,
        mode: String,
        transactionID: String,
        staffID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        }
    }],

    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    }
}, { timestamps: true });

// Auto-generate invoice number if not provided
invoiceSchema.pre('save', async function () {
    if (!this.invoiceNumber) {
        const year = new Date().getFullYear();
        const lastInvoice = await this.constructor.findOne().sort({ createdAt: -1 });
        let nextNum = 1;
        if (lastInvoice && lastInvoice.invoiceNumber) {
            const parts = lastInvoice.invoiceNumber.split('-');
            if (parts.length === 3) {
                nextNum = parseInt(parts[2]) + 1;
            }
        }
        this.invoiceNumber = `INV-${year}-${String(nextNum).padStart(4, '0')}`;
    }

    // Calculate balance
    this.balanceAmount = this.totalAmount - this.paidAmount;

    // Update status based on payment
    if (this.paidAmount === 0) {
        if (this.status !== 'draft' && this.status !== 'cancelled') {
            this.status = 'pending';
        }
    } else if (this.paidAmount >= this.totalAmount) {
        this.status = 'paid';
    } else {
        this.status = 'partial';
    }

    // Check if overdue
    if (this.dueDate && this.dueDate < new Date() && this.balanceAmount > 0) {
        this.status = 'overdue';
    }
});

// Indexes
invoiceSchema.index({ memberID: 1, invoiceDate: -1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
