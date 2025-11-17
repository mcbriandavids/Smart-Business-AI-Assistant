/**
 * Vendor Routes
 * -------------
 * Admin: List all vendors
 */
const express = require("express");
const Joi = require("joi");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const Controller = require("../controllers/vendor.controller");
const router = express.Router();

// @desc    List vendors
// @route   GET /api/vendors
// @access  Private (Admin)
router.get(
  "/",
  protect,
  authorize("admin"),
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
    }).unknown(true),
  }),
  Controller.listVendors
);

module.exports = router;
