const express = require("express");
const router = express.Router();
const User = require("../Model/user");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");

/* ===========================
   JWT TOKEN
=========================== */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

/* ===========================
   SIGNUP
=========================== */
router.post("/signup", async (req, res) => {
  try {
    await new User(req.body).save();
    res.status(201).json({ message: "User added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* ===========================
   LOGIN
=========================== */
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== req.body.password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "User account is disabled" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: `Welcome ${user.role}`,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* ===========================
   GET USER BY ID
=========================== */
router.get("/user/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* ===========================
   GET ALL USERS (ADMIN)
=========================== */
router.get("/users", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* ===========================
   DELETE USER (ADMIN)
=========================== */
router.delete("/user/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});
/* ===========================
   ENABLE / DISABLE USER (ADMIN)
=========================== */
router.patch("/user/:id/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: `User ${user.isActive ? "enabled" : "disabled"} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});
module.exports = router;