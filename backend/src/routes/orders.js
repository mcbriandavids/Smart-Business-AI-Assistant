/**
 * Orders Routes
 * -------------
 * Thin HTTP layer that validates input and delegates logic to the Orders controller.
 */
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const Joi = require("joi");
const Orders = require("../controllers/orders.controller");
const router = express.Router();

// @desc    Create an order
// @route   POST /api/orders
// @access  Private (Customer)
router.post(
  "/",
  protect,
  authorize("customer", "admin"),
  validate({
    body: Joi.object({
      business: Joi.string().hex().length(24).required(),
      items: Joi.array()
        .items(
          Joi.object({
            product: Joi.string().hex().length(24).required(),
            quantity: Joi.number().integer().min(1).default(1),
            variants: Joi.array()
              .items(
                Joi.object({
                  name: Joi.string().required(),
                  option: Joi.string().required(),
                  priceModifier: Joi.number().default(0),
                })
              )
              .default([]),
            notes: Joi.string().max(300).allow("", null),
          })
        )
        .min(1)
        .required(),
      deliveryInfo: Joi.object({
        type: Joi.string().valid("delivery", "pickup").required(),
        address: Joi.object({
          street: Joi.string().allow("", null),
          city: Joi.string().allow("", null),
          state: Joi.string().allow("", null),
          zipCode: Joi.string().allow("", null),
          country: Joi.string().allow("", null),
          coordinates: Joi.object({
            lat: Joi.number(),
            lng: Joi.number(),
          }).optional(),
          instructions: Joi.string().allow("", null),
        }).optional(),
      }).required(),
      paymentInfo: Joi.object({
        method: Joi.string()
          .valid("cash", "card", "mobile_money", "bank_transfer", "crypto")
          .default("cash"),
        status: Joi.string()
          .valid("pending", "paid", "failed", "refunded")
          .optional(),
        transactionId: Joi.string().optional(),
      }).optional(),
      customerNotes: Joi.string().max(500).allow("", null),
    }),
  }),
  Orders.createOrder
);

// @desc    Get orders for current user (customer or vendor)
// @route   GET /api/orders
// @access  Private
router.get("/", protect, Orders.listOrders);

// @desc    Update order status (vendor/admin)
// @route   PUT /api/orders/:id/status
// @access  Private (Vendor/Admin)
router.put(
  "/:id/status",
  protect,
  authorize("vendor", "admin"),
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
    body: Joi.object({
      status: Joi.string()
        .valid(
          "pending",
          "confirmed",
          "rejected",
          "preparing",
          "ready",
          "out_for_delivery",
          "delivered",
          "completed",
          "cancelled"
        )
        .required(),
      note: Joi.string().max(300).allow("", null).optional(),
    }),
  }),
  Orders.updateOrderStatus
);

// @desc    Get single order (auth: customer/vendor/admin)
// @route   GET /api/orders/:id
// @access  Private
router.get(
  "/:id",
  protect,
  validate({
    params: Joi.object({ id: Joi.string().hex().length(24).required() }),
  }),
  Orders.getOrderById
);

module.exports = router;
