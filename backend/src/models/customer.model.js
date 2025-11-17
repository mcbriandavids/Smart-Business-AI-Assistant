/**
 * Customer Model
 * --------------
 * Stores customers for each vendor/business. Supports messaging and CRUD.
 */
const mongoose = require("mongoose");

const customer = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    messages: [
      {
        content: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ["product", "price", "general"],
          default: "general",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customer);
