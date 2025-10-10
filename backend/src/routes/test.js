/**
 * Test Utilities Routes (only mounted in NODE_ENV=test)
 * ----------------------------------------------------
 * Exposes helpers for tests to bootstrap admin users and other fixtures
 * without requiring direct model writes from test code.
 */
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const router = express.Router();

// POST /api/test/bootstrap-admin
// Creates (or promotes) a user to admin and returns an auth token
router.post("/bootstrap-admin", async (req, res) => {
  try {
    const {
      firstName = "Test",
      lastName = "Admin",
      email,
      phone,
      password = "password123",
    } = req.body || {};

    // Build defaults if not provided
    const unique = `${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
    const finalEmail = email || `admin_${unique}@example.com`;
    const finalPhone =
      phone || `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;

    // Find or create
    let user = await User.findOne({ email: finalEmail }).select("+password");
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email: finalEmail.toLowerCase(),
        phone: finalPhone,
        password,
        role: "admin",
        isVerified: true,
      });
    } else {
      user.role = "admin";
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    console.error("bootstrap-admin error:", err);
    return res
      .status(500)
      .json({ success: false, message: "bootstrap-admin failed" });
  }
});

module.exports = router;
