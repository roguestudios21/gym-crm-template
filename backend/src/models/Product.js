const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        help: "Duration in days"
    },
    description: String,

    // NEW: Product Category
    category: {
        type: String,
        enum: ['membership', 'session_pack', 'merchandise', 'other'],
        default: 'membership'
    },

    // FOR SESSION PACKS
    sessionCredits: {
        type: Number, // Total credits this pack adds to member's balance
        default: 0
    },

    // FOR MEMBERSHIPS (Legacy support + new structure)
    sessionTypes: [{
        name: String,              // "Personal Training", "Yoga", "Group Class", etc.
        sessionsIncluded: Number,  // Number of sessions of this type included in plan
        duration: Number,          // Minutes per session
        description: String,
        _id: false                 // Disable _id for subdocuments
    }],

    totalSessions: {
        type: Number,
        default: 0                 // Total sessions allowed across all types (0 = unlimited)
    },

    isUnlimited: {
        type: Boolean,
        default: false             // Unlimited sessions flag
    },

    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive']
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
