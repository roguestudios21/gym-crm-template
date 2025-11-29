const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientType: {
        type: String,
        enum: ['member', 'staff', 'all'],
        required: true
    },
    recipientID: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'recipientType'             // Dynamic reference
    },

    type: {
        type: String,
        enum: ['email', 'sms', 'both'],
        required: true
    },
    template: String,                        // Template name
    subject: String,                         // For email
    message: {
        type: String,
        required: true
    },

    scheduledFor: Date,                      // Null for immediate sending
    sentAt: Date,
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'scheduled'],
        default: 'pending'
    },

    context: mongoose.Schema.Types.Mixed,    // Template variables as key-value pairs

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    trigger: {
        type: String,
        enum: ['manual', 'auto'],
        default: 'manual'
    },
    triggerEvent: String,                    // "membership_expiry", "appointment_reminder", etc.

    errorMessage: String                     // If sending failed
}, { timestamps: true });

// Indexes
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ recipientID: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
