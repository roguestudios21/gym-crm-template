const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Member = require('../src/models/Member');
const Product = require('../src/models/Product');
const Sales = require('../src/models/Sales');
const Invoice = require('../src/models/Invoice');
const Payment = require('../src/models/Payment');
const Appointment = require('../src/models/Appointment');
const Staff = require('../src/models/Staff');
const Enquiry = require('../src/models/Enquiry');
const Class = require('../src/models/Class');
// const Notification = require('../src/models/Notification'); // If exists

const clearData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gym-crm');
        console.log('Connected to MongoDB');

        await Member.deleteMany({});
        console.log('Cleared Members');

        await Product.deleteMany({});
        console.log('Cleared Products');

        await Sales.deleteMany({});
        console.log('Cleared Sales');

        await Invoice.deleteMany({});
        console.log('Cleared Invoices');

        await Payment.deleteMany({});
        console.log('Cleared Payments');

        await Appointment.deleteMany({});
        console.log('Cleared Appointments');

        await Staff.deleteMany({});
        console.log('Cleared Staff');

        await Enquiry.deleteMany({});
        console.log('Cleared Enquiries');

        await Class.deleteMany({});
        console.log('Cleared Classes');

        // await Notification.deleteMany({});
        // console.log('Cleared Notifications');

        console.log('All data cleared successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

clearData();
