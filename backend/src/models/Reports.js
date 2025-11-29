const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: String,
    type: String,
    generatedBy: String, // User ID or Name
    data: Object, // Store report data as JSON
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Reports', reportSchema);
