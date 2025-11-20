const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const AgentController = require("../controllers/agent.controller");

// Vendor-only routes for the AI agent
router.post(
  "/",
  protect,
  authorize("vendor", "admin"),
  AgentController.createSession
);

router.post(
  "/:conversationId/actions",
  protect,
  authorize("vendor", "admin"),
  AgentController.act
);

router.post(
  "/:conversationId/feedback",
  protect,
  authorize("vendor", "admin"),
  validate({
    params: Joi.object({
      conversationId: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object({
      rating: Joi.number().min(1).max(5).required(),
      comment: Joi.string().allow("", null).max(1000),
      source: Joi.string()
        .valid("customer", "vendor", "agent", "system")
        .optional(),
      followUpRequired: Joi.boolean().optional(),
      escalate: Joi.boolean().optional(),
    }),
  }),
  AgentController.submitFeedback
);

router.get(
  "/tools",
  protect,
  authorize("vendor", "admin"),
  AgentController.listToolActivity
);

router.get(
  "/conversations",
  protect,
  authorize("vendor", "admin"),
  AgentController.listConversations
);

module.exports = router;
