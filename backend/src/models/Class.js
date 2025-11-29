const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true                       // "Morning Yoga", "Evening CrossFit", etc.
    },
    type: {
        type: String,
        required: true                       // "Yoga", "Zumba", "CrossFit", "Pilates", etc.
    },
    description: String,
    trainerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },

    schedule: {
        isRecurring: {
            type: Boolean,
            default: true
        },
        daysOfWeek: [{
            type: Number,
            min: 0,                          // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            max: 6
        }],
        time: {
            type: String,
            required: true                   // "09:00", "18:30", etc.
        },
        duration: {
            type: Number,
            required: true                   // Minutes
        }
    },

    capacity: {
        type: Number,
        required: true,
        default: 20
    },
    location: {
        type: String,
        default: 'Main Studio'               // "Studio A", "Main Hall", etc.
    },

    bookings: [{
        memberID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member'
        },
        bookingDate: {
            type: Date,
            default: Date.now
        },
        specificDate: Date,                  // For which class session
        status: {
            type: String,
            enum: ['confirmed', 'cancelled', 'waitlist', 'attended', 'no-show'],
            default: 'confirmed'
        },
        waitlistPosition: Number
    }],

    status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled'],
        default: 'active'
    },
    notes: String,
    imageUrl: String                         // Class promotional image
}, { timestamps: true });

// Method to get current bookings count for a specific date
classSchema.methods.getBookingsCount = function (date) {
    if (!date) return this.bookings.length;

    const dateStr = date.toISOString().split('T')[0];
    return this.bookings.filter(b => {
        if (!b.specificDate) return false;
        const bookingDateStr = b.specificDate.toISOString().split('T')[0];
        return bookingDateStr === dateStr && b.status === 'confirmed';
    }).length;
};

// Method to check if class is full for a specific date
classSchema.methods.isFull = function (date) {
    return this.getBookingsCount(date) >= this.capacity;
};

// Method to get available spots
classSchema.methods.getAvailableSpots = function (date) {
    return Math.max(0, this.capacity - this.getBookingsCount(date));
};

// Indexes
classSchema.index({ type: 1, status: 1 });
classSchema.index({ trainerID: 1 });
classSchema.index({ 'schedule.daysOfWeek': 1 });

module.exports = mongoose.model('Class', classSchema);
