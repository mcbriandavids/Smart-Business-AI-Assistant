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

// @desc    List agent conversations with feedback/flags
// @route   GET /api/admin/agent/conversations
// @access  Private (Admin)
router.get(
  "/agent/conversations",
  protect,
  authorize("admin"),
  validate({
    query: Joi.object({
      status: Joi.string().valid("active", "closed", "archived").optional(),
      flagStatus: Joi.string()
        .valid("open", "in_review", "resolved", "dismissed", "none")
        .optional(),
      minRating: Joi.number().min(1).max(5).optional(),
      maxRating: Joi.number().min(1).max(5).optional(),
      q: Joi.string().allow("", null).optional(),
      vendorId: Joi.string().hex().length(24).optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
    }).unknown(true),
  }),
  Controller.listConversationFeedback
);

// @desc    Update QA flag status/notes
// @route   PATCH /api/admin/agent/conversations/:conversationId/flags/:flagId
// @access  Private (Admin)
router.patch(
  "/agent/conversations/:conversationId/flags/:flagId",
  protect,
  authorize("admin"),
  validate({
    params: Joi.object({
      conversationId: Joi.string().hex().length(24).required(),
      flagId: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object({
      status: Joi.string()
        .valid("open", "in_review", "resolved", "dismissed")
        .optional(),
      notes: Joi.string().allow("", null).max(2000).optional(),
    }).min(1),
  }),
  Controller.updateQaFlag
);

module.exports = router;
