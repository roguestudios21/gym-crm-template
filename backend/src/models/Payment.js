const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentNumber: {
        type: String,
        unique: true
    },
    invoiceID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true
    },
    memberID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'card', 'upi', 'netbanking', 'cheque', 'other'],
        required: true
    },
    transactionID: String,                   // For digital payments
    chequeNumber: String,                    // For cheque payments
    bankName: String,                        // For cheque/netbanking

    receiptGenerated: {
        type: Boolean,
        default: false
    },
    notes: String,
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    }
}, { timestamps: true });

// Auto-generate payment number
paymentSchema.pre('save', async function (next) {
    if (!this.paymentNumber) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Payment').countDocuments();
        this.paymentNumber = `PAY-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Indexes
paymentSchema.index({ memberID: 1, paymentDate: -1 });
paymentSchema.index({ invoiceID: 1 });
paymentSchema.index({ paymentNumber: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
