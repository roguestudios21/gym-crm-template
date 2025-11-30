const express = require('express');
const app = express();
const connectDB = require("./config/db");
connectDB();

const cors = require('cors');
const path = require('path');
const db = require('./config/db');

// Configure CORS properly
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));

// Import routes
const membersRouter = require('./routes/members');
const staffRouter = require('./routes/staff');
const appointmentsRouter = require('./routes/appointments');
const salesRouter = require('./routes/sales');
const enquiryRouter = require('./routes/enquiry');
const reportsRouter = require('./routes/reports');
const attendanceRouter = require('./routes/attendance');
const invoicesRouter = require('./routes/invoices');
const paymentsRouter = require('./routes/payments');
const classesRouter = require('./routes/classes');
const notificationsRouter = require('./routes/notifications');

// Register routes
app.use('/api/members', membersRouter);
app.use('/api/staff', staffRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/enquiries', enquiryRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/products', require('./routes/products'));
app.use('/api/attendance', attendanceRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/classes', classesRouter);
app.use('/api/notifications', notificationsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
