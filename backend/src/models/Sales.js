const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
    memberID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    amount: {
        type: Number,
        required: true
    },
    type: String, // e.g., 'subscription', 'product'
    description: String,
    date: {
        type: Date,
        default: Date.now
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    paymentMode: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Other'],
        default: 'Cash'
    }
}, { timestamps: true });

module.exports = mongoose.model('Sales', salesSchema);
