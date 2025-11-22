/**
 * Auth Routes
 * -----------
 * Handles registration, login, profile, password changes, and admin creation.
 */
const express = require("express");
const Joi = require("joi");
const validate = require("../middleware/validate");
const { protect, authorize, createRateLimit } = require("../middleware/auth");
const Controller = require("../controllers/auth.controller");
const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = createRateLimit(
  15 * 60 * 1000,
  5,
  "Too many authentication attempts"
);
const registerLimiter = createRateLimit(
  60 * 60 * 1000,
  3,
  "Too many registration attempts"
);

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post(
  "/register",
  registerLimiter,
  validate({
    body: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().min(10).required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid("customer", "vendor").optional(),
      address: Joi.object().optional(),
    }),
  }),
  Controller.register
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  authLimiter,
  validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  Controller.login
);

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
router.post(
  "/forgot-password",
  authLimiter,
  validate({
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  }),
  Controller.forgotPassword
);

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
router.post(
  "/reset-password",
  authLimiter,
  validate({
    body: Joi.object({
      token: Joi.string().required(),
      password: Joi.string().min(6).required(),
    }),
  }),
  Controller.resetPassword
);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, Controller.me);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put(
  "/profile",
  protect,
  validate({
    body: Joi.object({
      firstName: Joi.string(),
      lastName: Joi.string(),
      phone: Joi.string(),
      address: Joi.object(),
      preferences: Joi.object(),
    }),
  }),
  Controller.updateProfile
);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put(
  "/change-password",
  protect,
  authLimiter,
  validate({
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
    }),
  }),
  Controller.changePassword
);

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", protect, Controller.logout);

// @desc    Admin route to create admin user
// @route   POST /api/auth/create-admin
// @access  Private (Admin only)
router.post(
  "/create-admin",
  protect,
  authorize("admin"),
  validate({
    body: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().min(10).required(),
      password: Joi.string().min(6).required(),
    }),
  }),
  Controller.createAdmin
);

module.exports = router;
