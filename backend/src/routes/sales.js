const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Sales = require("../models/Sales");

// LIST ALL SALES
router.get("/", async (req, res) => {
  try {
    const sales = await Sales.find().populate("memberID", "name").populate("product", "name").populate("staff", "name");
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sales history for charts
router.get('/history', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    } else {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    }

    const sales = await Sales.find({
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Aggregate by day
    const dailyData = {};
    sales.forEach(sale => {
      const day = new Date(sale.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (!dailyData[day]) {
        dailyData[day] = 0;
      }
      dailyData[day] += sale.amount;
    });

    // Format for chart
    const chartData = Object.entries(dailyData).map(([name, sales]) => ({
      name,
      sales
    }));

    res.json(chartData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Member = require("../models/Member");
const Product = require("../models/Product");

// ADD SALE (Integrated with Invoice & Payment)
router.post("/add", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { memberID, product, amount, staff, paymentMode, description } = req.body;

    if (!memberID) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Member is required for Invoice generation" });
    }

    // Clean up empty strings for ObjectIds
    const cleanProduct = product === "" ? null : product;
    const cleanStaff = staff === "" ? null : staff;

    // 1. Create Sale Record
    const [sale] = await Sales.create([{
      memberID,
      product: cleanProduct,
      amount,
      staff: cleanStaff,
      paymentMode,
      description
    }], { session });

    // 2. Create Invoice
    // Generate Unique Invoice Number
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 }).session(session);
    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const parts = lastInvoice.invoiceNumber.split('-');
      if (parts.length === 3) {
        nextNum = parseInt(parts[2]) + 1;
      }
    }
    const invoiceNumber = `INV-${new Date().getFullYear()}-${nextNum.toString().padStart(4, '0')}`;

    const [invoice] = await Invoice.create([{
      invoiceNumber,
      memberID,
      invoiceDate: new Date(),
      dueDate: new Date(),
      items: [{
        description: description || "Sale Item",
        quantity: 1,
        unitPrice: amount,
        amount: amount
      }],
      subtotal: amount,
      tax: 0,
      discount: 0,
      totalAmount: amount,
      paidAmount: amount,
      balanceAmount: 0,
      status: 'paid',
      notes: `Auto-generated from Sale #${sale._id}`
    }], { session });

    // 3. Create Payment Record
    const [payment] = await Payment.create([{
      invoiceID: invoice._id,
      memberID,
      amount,
      paymentMode: (paymentMode || 'cash').toLowerCase(),
      paymentDate: new Date(),
      notes: `Sale #${sale._id} - ${description || ''}`,
      receivedBy: cleanStaff
    }], { session });

    // Update invoice with payment history
    invoice.paymentHistory.push({
      paymentID: payment._id,
      amount,
      date: payment.paymentDate,
      mode: paymentMode,
      staffID: cleanStaff
    });
    await invoice.save({ session });

    // If product is a membership/session pack, update member
    if (cleanProduct) {
      const productDoc = await Product.findById(cleanProduct).session(session);
      if (productDoc) {
        const memberDoc = await Member.findById(memberID).session(session);
        if (memberDoc) {
          if (productDoc.category === "Session Packs") {
            memberDoc.sessionsRemaining = (memberDoc.sessionsRemaining || 0) + (productDoc.sessions || 0);
          } else if (productDoc.category === "Memberships") {
            const today = new Date();
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + (productDoc.durationDays || 30));

            memberDoc.membership = {
              currentPlan: cleanProduct,
              startDate: today,
              endDate: endDate,
              status: 'active',
              autoRenew: false,
              history: [
                ...(memberDoc.membership?.history || []),
                {
                  planID: cleanProduct,
                  startDate: today,
                  endDate: endDate,
                  amount: amount
                }
              ]
            };
            memberDoc.status = 'active';
          }
          await memberDoc.save({ session });
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, invoiceID: invoice._id });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE SALE
router.put("/update/:id", async (req, res) => {
  try {
    const sale = await Sales.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ success: true, sale });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE SALE
router.delete("/delete/:id", async (req, res) => {
  try {
    await Sales.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Sale Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FILTER SALES
router.post("/filter", async (req, res) => {
  try {
    const result = await Sales.find(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GENERATE SALES REPORT
router.get("/report", async (req, res) => {
  try {
    const data = await Sales.find();
    res.json({
      totalRevenue: data.reduce((acc, s) => acc + s.amount, 0),
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
