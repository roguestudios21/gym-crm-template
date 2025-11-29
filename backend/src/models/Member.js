const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    memberID: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    gender: String,
    DOB: String,
    profilePicture: String,
    contact1: String,
    contact2: String,
    email: String,
    address: String,
    emergencyName: String,
    emergencyNumber: String,
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive', 'frozen', 'expired', 'suspended']
    },
    subscription: String,
    spaHistory: {
        type: Array,
        default: []
    },
    dietHistory: {
        type: Array,
        default: []
    },
    biometric: {
        type: Object
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    startDate: Date,
    endDate: Date,

    // NEW: Universal Session Balance (Decoupled from specific plans)
    sessionBalance: [{
        sessionType: String, // e.g., "PT", "Yoga", "General"
        balance: { type: Number, default: 0 },
        _id: false
    }],

    // NEW: Enhanced Membership Management
    membership: {
        currentPlan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['active', 'expired', 'frozen', 'suspended'],
            default: 'active'
        },
        autoRenew: {
            type: Boolean,
            default: false
        },
        renewalSettings: {
            daysBefore: {
                type: Number,
                default: 7
            },
            notificationSent: {
                type: Boolean,
                default: false
            }
        },

        // Session tracking (Legacy - kept for backward compatibility if needed, but moving to top-level)
        sessionsRemaining: {
            total: { type: Number, default: 0 },
            byType: [{ sessionType: String, remaining: Number, _id: false }]
        },

        // Freeze functionality
        freezeHistory: [{
            startDate: Date,
            endDate: Date,
            reason: String,
            approvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Staff'
            }
        }],
        currentlyFrozen: {
            type: Boolean,
            default: false
        },

        // Membership history
        history: [{
            planID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            startDate: Date,
            endDate: Date,
            amount: Number,
            invoiceID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Invoice'
            }
        }]
    },

    // NEW: Biometric/Attendance Data
    biometricData: {
        fingerprintTemplates: [String],     // Hashed fingerprint templates
        enrollmentDate: Date,
        deviceIDs: [String],                // Authorized scanner devices
        isEnrolled: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true });

// Method to calculate days remaining in membership
memberSchema.methods.getDaysRemaining = function () {
    if (!this.membership || !this.membership.endDate) return null;
    const now = new Date();
    const end = new Date(this.membership.endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Method to check if membership is expiring soon
memberSchema.methods.isExpiringSoon = function (days = 7) {
    const remaining = this.getDaysRemaining();
    return remaining !== null && remaining > 0 && remaining <= days;
};

// Method to update session count
// Method to update session count
memberSchema.methods.consumeSession = function (sessionType) {
    // 1. Check Universal Balance first
    if (this.sessionBalance && this.sessionBalance.length > 0) {
        const typeBalance = this.sessionBalance.find(s => s.sessionType === sessionType);
        if (typeBalance && typeBalance.balance > 0) {
            typeBalance.balance--;
            return true;
        }
    }

    // 2. Fallback to Legacy Membership Balance
    if (this.membership && this.membership.sessionsRemaining) {
        const typeSession = this.membership.sessionsRemaining.byType.find(
            s => s.sessionType === sessionType
        );
        if (typeSession && typeSession.remaining > 0) {
            typeSession.remaining--;
            return true;
        }
    }

    return false; // No sessions available
};

// Method to add sessions (Top-up)
memberSchema.methods.addSessions = function (sessionType, count) {
    if (!this.sessionBalance) this.sessionBalance = [];

    const typeBalance = this.sessionBalance.find(s => s.sessionType === sessionType);
    if (typeBalance) {
        typeBalance.balance += count;
    } else {
        this.sessionBalance.push({ sessionType, balance: count });
    }
};

module.exports = mongoose.model('Member', memberSchema);
