// @desc    Get notifications sent by the current user (as sender)
// @route   GET /api/notifications/sent
// @access  Private
/**
 * Notifications Routes
 * --------------------
 * In-app notifications for users and admin announcements endpoint.
 */
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const Joi = require("joi");
const Controller = require("../controllers/notifications.controller");
const router = express.Router();

// @desc    Get notifications sent by the current user (as sender)
// @route   GET /api/notifications/sent
// @access  Private
router.get("/sent", protect, Controller.listSent);

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
router.get("/", protect, Controller.list);

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put(
  "/:id/read",
  protect,
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.markRead
);

// @desc    Create a system announcement (admin)
// @route   POST /api/notifications/announce
// @access  Private (Admin)
router.post(
  "/announce",
  protect,
  authorize("admin"),
  validate({
    body: Joi.object({
      title: Joi.string().min(3).max(100).required(),
      message: Joi.string().min(3).max(500).required(),
      recipients: Joi.alternatives()
        .try(
          Joi.string().valid("all"),
          Joi.array().items(Joi.string().hex().length(24)).min(1)
        )
        .required(),
    }),
  }),
  Controller.announce
);

module.exports = router;
