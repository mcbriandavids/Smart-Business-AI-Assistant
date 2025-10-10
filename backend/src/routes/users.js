/**
 * Users Routes
 * ------------
 * Admin user management, profile access/updates, status toggles, and stats.
 */
const express = require("express");
const Joi = require("joi");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const Controller = require("../controllers/users.controller");
const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
router.get(
  "/",
  protect,
  authorize("admin"),
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      role: Joi.string().valid("customer", "vendor", "admin").optional(),
      search: Joi.string().allow("", null).optional(),
    }).unknown(true),
  }),
  Controller.list
);

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or own profile)
router.get(
  "/:id",
  protect,
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.getById
);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or own profile)
router.put(
  "/:id",
  protect,
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.update
);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.remove
);

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats/overview
// @access  Private (Admin)
router.get(
  "/stats/overview",
  protect,
  authorize("admin"),
  Controller.statsOverview
);

// @desc    Toggle user verification status
// @route   PUT /api/users/:id/verify
// @access  Private (Admin only)
router.put(
  "/:id/verify",
  protect,
  authorize("admin"),
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.toggleVerify
);

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle-active
// @access  Private (Admin only)
router.put(
  "/:id/toggle-active",
  protect,
  authorize("admin"),
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.toggleActive
);

// @desc    Get nearby users (for location-based features)
// @route   GET /api/users/nearby
// @access  Private
router.get(
  "/nearby",
  protect,
  validate({
    query: Joi.object({
      longitude: Joi.number().required(),
      latitude: Joi.number().required(),
      maxDistance: Joi.number().integer().min(1).default(10000),
    }).unknown(true),
  }),
  Controller.nearby
);

module.exports = router;
