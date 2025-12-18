const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../Model/Admin");

// ===========================
// GENERATE ADMIN TOKEN
// ===========================
const generateAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      username: admin.username,
      role: "admin",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // longer token for admins
  );
};

// ===========================
// ADMIN LOGIN
// ===========================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateAdminToken(admin);

    res.status(200).json({
      message: "Login successful",
      token, // 🔑 Save this separately on frontend as adminToken
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



module.exports = router;