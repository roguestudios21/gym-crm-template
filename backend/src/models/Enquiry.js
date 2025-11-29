const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    name: String,
    contact: String,
    email: String,
    type: String, // e.g., 'membership', 'personal_training'
    remarks: String,
    notes: String,
    status: {
        type: String,
        default: 'open'
    }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
