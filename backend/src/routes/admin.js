/**
 * Admin Routes
 * ------------
 * Admin stats, user management listing, and status toggles.
 */
const express = require("express");
const Joi = require("joi");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const Controller = require("../controllers/admin.controller");
const router = express.Router();

// @desc    Admin overview stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get("/stats", protect, authorize("admin"), Controller.stats);

// @desc    List users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get(
  "/users",
  protect,
  authorize("admin"),
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
    }).unknown(true),
  }),
  Controller.listUsers
);

// @desc    Toggle user activation
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private (Admin)
router.put(
  "/users/:id/toggle-active",
  protect,
  authorize("admin"),
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.toggleUserActive
);

module.exports = router;
