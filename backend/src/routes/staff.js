const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");
const { staffValidation } = require("../middleware/validation");

// LIST ALL STAFF
router.get("/", async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE STAFF
router.get("/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CREATE STAFF PROFILE
router.post("/create", async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE STAFF PROFILE
router.put("/update/:id", async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REQUEST LEAVE
router.post("/request-leave/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    staff.leaveBucket -= 1;
    await staff.save();
    res.json({ success: true, message: "Leave Requested", staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHECK AVAILABILITY
router.get("/availability/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    const available = staff.leaveBucket > 0;
    res.json({ available, staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
