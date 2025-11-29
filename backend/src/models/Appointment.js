const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    memberID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },

    // Enhanced session type tracking
    type: String,                           // Generic type (backward compatible)
    sessionType: {
        name: String,                       // Session type name from plan
        planID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    },

    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'],
        default: 'scheduled'
    },

    // Trainer/Staff assignment
    staffID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },

    // Session tracking
    sessionConsumed: {
        type: Boolean,
        default: false
    },
    memberSessionsRemaining: Number,        // Snapshot at booking time

    notes: String,
    cancellationReason: String,
    completedAt: Date
}, { timestamps: true });

// Index for faster queries
appointmentSchema.index({ memberID: 1, date: 1 });
appointmentSchema.index({ staffID: 1, date: 1 });
appointmentSchema.index({ sessionType: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
