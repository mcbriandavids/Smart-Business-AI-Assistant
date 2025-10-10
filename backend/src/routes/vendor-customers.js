/**
 * Vendor Customers Routes (kebab-case canonical)
 * ---------------------------------------------
 * Thin HTTP layer delegating to vendor customers controller.
 */
const express = require("express");
const { protect, authorize, createRateLimit } = require("../middleware/auth");
const validate = require("../middleware/validate");
const Joi = require("joi");
const Controller = require("../controllers/vendor/vendor-customers.controller");
const router = express.Router();

// Rate limiting for vendor broadcast to prevent spam
const broadcastLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // max 10 broadcasts per window per IP
  "Too many broadcast attempts. Please try again later."
);

// List contacts for vendor
router.get(
  "/",
  protect,
  authorize("vendor", "admin"),
  validate({
    query: Joi.object({
      vendorId: Joi.string().hex().length(24).optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      search: Joi.string().allow("", null),
    }).unknown(true),
  }),
  Controller.list
);

// Create/update a contact
router.post(
  "/",
  protect,
  authorize("vendor", "admin"),
  validate({
    body: Joi.object({
      id: Joi.string().hex().length(24).optional(),
      vendorId: Joi.string().hex().length(24).optional(),
      customer: Joi.string().hex().length(24).optional(),
      contact: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        phone: Joi.string().allow(null, "").optional(),
        email: Joi.string().email().allow(null, "").optional(),
        address: Joi.object({
          street: Joi.string().allow("", null),
          city: Joi.string().allow("", null),
          state: Joi.string().allow("", null),
          zipCode: Joi.string().allow("", null),
          country: Joi.string().allow("", null),
        }).optional(),
      }).required(),
      tags: Joi.array().items(Joi.string().trim()).default([]),
      notes: Joi.string().max(500).allow("", null).optional(),
      consentToContact: Joi.boolean().default(true),
    }),
  }),
  Controller.upsert
);

// Delete a contact
router.delete(
  "/:id",
  protect,
  authorize("vendor", "admin"),
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.remove
);

// Vendor broadcast notification (in-app now, SMS/Email placeholders)
router.post(
  "/broadcast",
  protect,
  authorize("vendor", "admin"),
  broadcastLimiter,
  validate({
    body: Joi.object({
      vendorId: Joi.string().hex().length(24).optional(),
      contactIds: Joi.array().items(Joi.string().hex().length(24)).default([]),
      title: Joi.string().min(3).max(100).required(),
      message: Joi.string().min(3).max(500).required(),
      product: Joi.string().hex().length(24).optional(),
      price: Joi.number().min(0).optional(),
      deliveryOffer: Joi.boolean().optional(),
      deliveryFee: Joi.number().min(0).optional(),
    }),
  }),
  Controller.broadcast
);

// Customer reply to a vendor prompt (creates a notification to vendor)
router.post(
  "/:id/reply",
  protect,
  authorize("customer", "admin"),
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
    body: Joi.object({ message: Joi.string().min(1).max(500).required() }),
  }),
  Controller.reply
);

module.exports = router;
