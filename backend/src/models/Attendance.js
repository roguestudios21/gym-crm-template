const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    memberID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    checkInTime: {
        type: Date,
        required: true
    },
    checkOutTime: Date,
    date: {
        type: Date,
        required: true                       // Date only (no time) for easier queries
    },
    method: {
        type: String,
        enum: ['biometric', 'manual', 'rfid', 'qr'],
        default: 'biometric'
    },
    deviceID: String,                        // Fingerprint scanner/device ID
    biometricTemplateHash: String,           // Hash of matched template
    status: {
        type: String,
        enum: ['checked-in', 'checked-out'],
        default: 'checked-in'
    },
    duration: Number,                        // Minutes (calculated oncheckout)
    location: {
        type: String,
        default: 'Main Gym'
    }
}, { timestamps: true });

// Indexes for performance
attendanceSchema.index({ memberID: 1, date: -1 });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1, checkInTime: -1 });

// Method to calculate duration
attendanceSchema.methods.calculateDuration = function () {
    if (this.checkOutTime && this.checkInTime) {
        const diffMs = this.checkOutTime - this.checkInTime;
        this.duration = Math.round(diffMs / 60000); // Convert to minutes
    }
};

module.exports = mongoose.model('Attendance', attendanceSchema);
