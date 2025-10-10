/**
 * Products Routes
 * ---------------
 * Public catalog endpoints and vendor/admin product management.
 */
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const Joi = require("joi");
const Controller = require("../controllers/products.controller");
const router = express.Router();

// @desc    Create product for vendor's business
// @route   POST /api/products
// @access  Private (Vendor)
router.post("/", protect, authorize("vendor", "admin"), Controller.create);

// @desc    Get all products (public) with filters
// @route   GET /api/products
// @access  Public
router.get("/", Controller.list);

// @desc    Get a product by id
// @route   GET /api/products/:id
// @access  Public
router.get(
  "/:id",
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.getById
);

// Ownership helper for product
async function ensureProductOwnership(productId, user) {
  const product = await Product.findById(productId).populate("business");
  if (!product) return { error: { status: 404, message: "Product not found" } };
  const isAdmin = user.role === "admin";
  const isOwner =
    product.business && product.business.owner.toString() === user.id;
  if (!isAdmin && !isOwner)
    return { error: { status: 403, message: "Access denied" } };
  return { product };
}

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Owner or Admin)
router.put(
  "/:id",
  protect,
  authorize("vendor", "admin"),
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.update
);

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Owner or Admin)
router.delete(
  "/:id",
  protect,
  authorize("vendor", "admin"),
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.remove
);

// @desc    Toggle product active status
// @route   PUT /api/products/:id/toggle-active
// @access  Private (Owner or Admin)
router.put(
  "/:id/toggle-active",
  protect,
  authorize("vendor", "admin"),
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Controller.toggleActive
);

module.exports = router;
