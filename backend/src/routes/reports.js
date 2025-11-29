const express = require('express');
const router = express.Router();
const Sales = require('../models/Sales');
const ReportSnapshot = require('../models/ReportSnapshot');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// Helper function to parse date range from query params
const getDateRange = (req) => {
  const { startDate, endDate } = req.query;
  let query = {};

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  return query;
};

// Daily Sales Report (DSR)
router.get('/dsr', async (req, res) => {
  try {
    const dateFilter = getDateRange(req);

    // If no date specified, use today
    if (!dateFilter.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateFilter.date = { $gte: today, $lt: tomorrow };
    }

    const sales = await Sales.find(dateFilter)
      .populate('memberID', 'name')
      .populate('product', 'name')
      .populate('staff', 'name');

    const total = sales.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({ date: new Date(), total, count: sales.length, sales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Monthly Sales Summary
router.get('/monthly', async (req, res) => {
  try {
    const dateFilter = getDateRange(req);

    const matchStage = Object.keys(dateFilter).length > 0 ? { $match: dateFilter } : null;

    const pipeline = matchStage
      ? [matchStage, {
        $group: {
          _id: { $month: "$date" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }, { $sort: { "_id": 1 } }]
      : [{
        $group: {
          _id: { $month: "$date" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }, { $sort: { "_id": 1 } }];

    const sales = await Sales.aggregate(pipeline);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Product-wise Sales Report
router.get('/product-wise', async (req, res) => {
  try {
    const dateFilter = getDateRange(req);

    const matchStage = Object.keys(dateFilter).length > 0 ? { $match: dateFilter } : null;

    const pipeline = matchStage ? [matchStage] : [];

    pipeline.push(
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$productDetails.name",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    );

    const sales = await Sales.aggregate(pipeline);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Category-wise Sales Report
router.get('/category-wise', async (req, res) => {
  try {
    const dateFilter = getDateRange(req);

    const matchStage = Object.keys(dateFilter).length > 0 ? { $match: dateFilter } : null;

    const pipeline = matchStage ? [matchStage] : [];

    pipeline.push({
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    });

    const sales = await Sales.aggregate(pipeline);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff Performance Report
router.get('/staff-performance', async (req, res) => {
  try {
    const dateFilter = getDateRange(req);

    const matchStage = Object.keys(dateFilter).length > 0 ? { $match: dateFilter } : null;

    const pipeline = matchStage ? [matchStage] : [];

    pipeline.push(
      {
        $lookup: {
          from: "staffs",
          localField: "staff",
          foreignField: "_id",
          as: "staffDetails"
        }
      },
      { $unwind: { path: "$staffDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$staffDetails.name",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    );

    const sales = await Sales.aggregate(pipeline);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cash vs Digital Payment Report
router.get('/payment-mode', async (req, res) => {
  try {
    const dateFilter = getDateRange(req);

    const matchStage = Object.keys(dateFilter).length > 0 ? { $match: dateFilter } : null;

    const pipeline = matchStage ? [matchStage] : [];

    pipeline.push({
      $group: {
        _id: "$paymentMode",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    });

    const sales = await Sales.aggregate(pipeline);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Financial Report (Actual Payments Received)
router.get('/financial', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = end;
      }
    }

    const payments = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.json({
      period: { startDate, endDate },
      totalRevenue,
      byMethod: payments.map(p => ({ method: p._id, amount: p.totalAmount, count: p.count }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== REPORT SNAPSHOT MANAGEMENT ==========

// Save Report Snapshot
router.post('/snapshot', async (req, res) => {
  try {
    const { reportType, dateRange, data, summary, notes } = req.body;

    const snapshot = new ReportSnapshot({
      reportType,
      dateRange,
      data,
      summary,
      notes
    });

    await snapshot.save();
    res.status(201).json({
      message: 'Report snapshot saved successfully',
      snapshotId: snapshot._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Report Snapshots (with pagination)
router.get('/snapshots', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    const sortBy = req.query.sortBy || 'generatedAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const snapshots = await ReportSnapshot.find()
      .select('-data') // Exclude large data field for list view
      .sort({ [sortBy]: order })
      .limit(limit)
      .skip(skip);

    const total = await ReportSnapshot.countDocuments();

    res.json({
      snapshots,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Specific Report Snapshot
router.get('/snapshots/:id', async (req, res) => {
  try {
    const snapshot = await ReportSnapshot.findById(req.params.id);

    if (!snapshot) {
      return res.status(404).json({ error: 'Report snapshot not found' });
    }

    res.json(snapshot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Report Snapshot
router.delete('/snapshots/:id', async (req, res) => {
  try {
    const snapshot = await ReportSnapshot.findByIdAndDelete(req.params.id);

    if (!snapshot) {
      return res.status(404).json({ error: 'Report snapshot not found' });
    }

    res.json({ message: 'Report snapshot deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
