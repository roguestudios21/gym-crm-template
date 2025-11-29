const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Member = require('../models/Member');

// Get all classes
router.get('/', async (req, res) => {
    try {
        const { type, status, trainerID } = req.query;

        let query = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (trainerID) query.trainerID = trainerID;

        const classes = await Class.find(query)
            .populate('trainerID', 'name')
            .sort({ 'schedule.time': 1 });

        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get specific class
router.get('/:id', async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id)
            .populate('trainerID', 'name contact1')
            .populate('bookings.memberID', 'name contact1');

        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.json(classData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create class
router.post('/', async (req, res) => {
    try {
        const { name, type, description, trainerID, schedule, capacity, location, notes } = req.body;

        const classData = new Class({
            name,
            type,
            description,
            trainerID,
            schedule,
            capacity,
            location,
            notes,
            status: 'active'
        });

        await classData.save();

        res.status(201).json(classData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update class
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;

        const classData = await Class.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.json(classData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete class
router.delete('/:id', async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Check if there are active bookings
        const activeBookings = classData.bookings.filter(b => b.status === 'confirmed').length;

        if (activeBookings > 0) {
            return res.status(400).json({
                error: 'Cannot delete class with active bookings',
                activeBookings
            });
        }

        await Class.findByIdAndDelete(req.params.id);

        res.json({ message: 'Class deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Book a member into a class
router.post('/:id/book', async (req, res) => {
    try {
        const { memberID, specificDate } = req.body;

        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Check if member exists
        const member = await Member.findById(memberID);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Check if class is full
        const bookingDate = specificDate ? new Date(specificDate) : new Date();
        const isFull = classData.isFull(bookingDate);

        // Check if member already booked
        const existingBooking = classData.bookings.find(b =>
            b.memberID.toString() === memberID &&
            b.specificDate &&
            b.specificDate.toISOString().split('T')[0] === bookingDate.toISOString().split('T')[0]
        );

        if (existingBooking) {
            return res.status(400).json({ error: 'Member already booked for this class' });
        }

        // Add booking
        const booking = {
            memberID,
            specificDate: bookingDate,
            status: isFull ? 'waitlist' : 'confirmed',
            waitlistPosition: isFull ? classData.bookings.filter(b => b.status === 'waitlist').length + 1 : null
        };

        classData.bookings.push(booking);
        await classData.save();

        res.json({
            message: isFull ? 'Added to waitlist' : 'Booking confirmed',
            booking,
            availableSpots: classData.getAvailableSpots(bookingDate)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel booking
router.post('/:id/cancel-booking', async (req, res) => {
    try {
        const { memberID, specificDate } = req.body;

        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        const bookingDate = new Date(specificDate);

        // Find and update booking
        const booking = classData.bookings.find(b =>
            b.memberID.toString() === memberID &&
            b.specificDate &&
            b.specificDate.toISOString().split('T')[0] === bookingDate.toISOString().split('T')[0]
        );

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        booking.status = 'cancelled';

        // Promote from waitlist if applicable
        if (booking.status === 'confirmed') {
            const waitlistBooking = classData.bookings.find(b =>
                b.status === 'waitlist' &&
                b.specificDate &&
                b.specificDate.toISOString().split('T')[0] === bookingDate.toISOString().split('T')[0]
            );

            if (waitlistBooking) {
                waitlistBooking.status = 'confirmed';
                waitlistBooking.waitlistPosition = null;
            }
        }

        await classData.save();

        res.json({
            message: 'Booking cancelled successfully',
            classData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark attendance for a class session
router.post('/:id/mark-attendance', async (req, res) => {
    try {
        const { date, attendees } = req.body;

        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        const sessionDate = new Date(date);

        // Update booking statuses
        classData.bookings.forEach(booking => {
            if (booking.specificDate &&
                booking.specificDate.toISOString().split('T')[0] === sessionDate.toISOString().split('T')[0]) {

                if (attendees.includes(booking.memberID.toString())) {
                    booking.status = 'attended';
                } else if (booking.status === 'confirmed') {
                    booking.status = 'no-show';
                }
            }
        });

        await classData.save();

        res.json({
            message: 'Attendance marked successfully',
            attendeesCount: attendees.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get class schedule (weekly/monthly view)
router.get('/schedule/view', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const classes = await Class.find({ status: 'active' })
            .populate('trainerID', 'name');

        // Generate schedule for date range
        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

        const schedule = [];

        classes.forEach(classData => {
            if (classData.schedule.isRecurring) {
                // Generate recurring sessions
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dayOfWeek = d.getDay();

                    if (classData.schedule.daysOfWeek.includes(dayOfWeek)) {
                        schedule.push({
                            classID: classData._id,
                            className: classData.name,
                            type: classData.type,
                            date: new Date(d),
                            time: classData.schedule.time,
                            duration: classData.schedule.duration,
                            trainer: classData.trainerID,
                            capacity: classData.capacity,
                            booked: classData.getBookingsCount(new Date(d)),
                            available: classData.getAvailableSpots(new Date(d))
                        });
                    }
                }
            }
        });

        res.json(schedule.sort((a, b) => a.date - b.date));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get member's booked classes
router.get('/member/:memberID/bookings', async (req, res) => {
    try {
        const classes = await Class.find({
            'bookings.memberID': req.params.memberID,
            'bookings.status': { $in: ['confirmed', 'waitlist'] }
        })
            .populate('trainerID', 'name');

        const bookings = [];

        classes.forEach(classData => {
            const memberBookings = classData.bookings.filter(
                b => b.memberID.toString() === req.params.memberID &&
                    ['confirmed', 'waitlist'].includes(b.status)
            );

            memberBookings.forEach(booking => {
                bookings.push({
                    class: {
                        id: classData._id,
                        name: classData.name,
                        type: classData.type,
                        trainer: classData.trainerID
                    },
                    booking
                });
            });
        });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
