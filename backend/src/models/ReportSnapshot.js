const mongoose = require('mongoose');

const ReportSnapshotSchema = new mongoose.Schema({
    reportType: {
        type: String,
        required: true,
        enum: ['daily', 'monthly', 'comprehensive', 'custom']
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    generatedBy: {
        type: String,
        default: 'System'
    },
    dateRange: {
        start: { type: Date, required: true },
        end: { type: Date, required: true }
    },
    data: {
        dsr: mongoose.Schema.Types.Mixed,
        monthly: [mongoose.Schema.Types.Mixed],
        productWise: [mongoose.Schema.Types.Mixed],
        staffPerformance: [mongoose.Schema.Types.Mixed],
        paymentMode: [mongoose.Schema.Types.Mixed]
    },
    summary: {
        totalRevenue: { type: Number, default: 0 },
        totalTransactions: { type: Number, default: 0 },
        topProduct: String,
        topStaff: String,
        averageTransactionValue: Number
    },
    notes: String
}, {
    timestamps: true
});

// Index for faster queries
ReportSnapshotSchema.index({ generatedAt: -1 });
ReportSnapshotSchema.index({ reportType: 1 });

module.exports = mongoose.model('ReportSnapshot', ReportSnapshotSchema);
