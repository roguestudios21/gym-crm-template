const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const Member = require("../models/Member");

// LIST ALL ENQUIRIES
router.get("/", async (req, res) => {
  try {
    const enquiries = await Enquiry.find();
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ADD ENQUIRY
router.post("/add", async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    res.json({ success: true, enquiry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FILTER ENQUIRIES
router.post("/filter", async (req, res) => {
  try {
    const enquiries = await Enquiry.find(req.body);
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONVERT ENQUIRY → MEMBER
router.post("/convert/:id", async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    const newMember = new Member({
      name: enquiry.remarks,
      status: "ACTIVE",
    });

    await newMember.save();
    res.json({ success: true, newMember });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
