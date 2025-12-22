const express = require('express');
const router = express.Router();
const Donation = require('../Model/Donation');

const verifyToken = require('../middleware/auth'); // validates JWT

const verifyAdmin = require('../middleware/adminauth'); // ⬅️ admin check middleware

/* =====================================================
   USER: Donation History (Logged-in User)
   GET /api/donations/history?page=1&limit=10
===================================================== */
router.get('/donations/history', verifyToken, async (req, res) => {
  try {
    const email = req.user.email; // from JWT
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalDocs = await Donation.countDocuments({ email });
    const totalPages = Math.ceil(totalDocs / limit);

    const donations = await Donation.find({ email })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      donations,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch donation history' });
  }
});

/* =====================================================
   ADMIN: Successful Donation History
   GET /api/donations/admin?status=succeeded&page=1&limit=10
===================================================== */
router.get('/donations/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const status = req.query.status || 'succeeded';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { status };

    const totalDocs = await Donation.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      donations,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin donation history' });
  }
});

module.exports = router;