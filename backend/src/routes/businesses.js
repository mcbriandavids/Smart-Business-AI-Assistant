/**
 * Businesses Routes
 * -----------------
 * Business registration, listing with Haversine proximity, CRUD, and status.
 */
const express = require("express");
const Joi = require("joi");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const Controller = require("../controllers/businesses.controller");
const router = express.Router();

// (Haversine is now in the controller)

// @desc    Register a new business
// @route   POST /api/businesses
// @access  Private (Vendor only)
router.post(
  "/",
  protect,
  authorize("vendor"),
  validate({
    body: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().min(5).max(500).required(),
      category: Joi.string().required(),
      address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
        country: Joi.string().required(),
        coordinates: Joi.object({
          lat: Joi.number().required(),
          lng: Joi.number().required(),
        }).required(),
      }).required(),
      contact: Joi.object({
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        website: Joi.string().uri().allow(null, ""),
        socialMedia: Joi.object({
          facebook: Joi.string().allow("", null),
          twitter: Joi.string().allow("", null),
          instagram: Joi.string().allow("", null),
          linkedin: Joi.string().allow("", null),
        }).optional(),
      }).required(),
      businessHours: Joi.object().optional(),
      services: Joi.object().optional(),
      paymentMethods: Joi.array().items(Joi.string()).optional(),
    }),
  }),
  Controller.register
);

// @desc    Get all businesses
// @route   GET /api/businesses
// @access  Public
router.get(
  "/",
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      category: Joi.string().allow("", null),
      search: Joi.string().allow("", null),
      latitude: Joi.number().optional(),
      longitude: Joi.number().optional(),
      maxDistanceKm: Joi.number().optional(),
    }).unknown(true),
  }),
  Controller.list
);

// @desc    Get business by ID
// @route   GET /api/businesses/:id
// @access  Public
router.get(
  "/:id",
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.getById
);

// @desc    Update business
// @route   PUT /api/businesses/:id
// @access  Private (Business owner or admin)
router.put(
  "/:id",
  protect,
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.update
);

// @desc    Delete business
// @route   DELETE /api/businesses/:id
// @access  Private (Business owner or admin)
router.delete(
  "/:id",
  protect,
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.remove
);

// @desc    Toggle business verification
// @route   PUT /api/businesses/:id/verify
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

// @desc    Get business categories
// @route   GET /api/businesses/categories/list
// @access  Public
router.get("/categories/list", Controller.categories);

// @desc    Check if business is currently open
// @route   GET /api/businesses/:id/status
// @access  Public
router.get(
  "/:id/status",
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.status
);

// @desc    Get businesses near location
// @route   GET /api/businesses/nearby/:longitude/:latitude
// @access  Public
router.get(
  "/nearby/:longitude/:latitude",
  validate({
    params: Joi.object({
      longitude: Joi.number().required(),
      latitude: Joi.number().required(),
    }),
    query: Joi.object({
      maxDistanceKm: Joi.number().default(5),
      category: Joi.string().allow("", null),
    }).unknown(true),
  }),
  Controller.nearby
);

module.exports = router;
