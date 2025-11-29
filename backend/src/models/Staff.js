const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: String,
    contact: String,
    email: String,
    leaveBucket: {
        type: Number,
        default: 20
    },
    status: {
        type: String,
        default: 'active'
    },
    address: String,
    salary: Number,
    joiningDate: Date,
    emergencyContact: String
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
