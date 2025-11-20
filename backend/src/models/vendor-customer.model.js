/**
 * VendorCustomer Model
 * --------------------
 * Stores vendor-managed contacts (may or may not be registered users).
 * Enables tagging, notes, and consent tracking for communication.
 */
const mongoose = require("mongoose");

const vendorCustomerSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contact: {
      name: { type: String, required: true },
      phone: { type: String },
      email: { type: String },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
    },
    tags: { type: [String], default: [] },
    notes: { type: String, default: "" },
    lifecycleStage: {
      type: String,
      enum: ["lead", "prospect", "customer", "vip", "churn_risk"],
      default: "lead",
    },
    preferredChannel: {
      type: String,
      enum: ["sms", "email", "in_app", "whatsapp"],
      default: "in_app",
    },
    consentToContact: { type: Boolean, default: true },
    lastInteractionAt: Date,
    metrics: {
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      messagesSent: { type: Number, default: 0 },
      responsesReceived: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

vendorCustomerSchema.index(
  { vendor: 1, "contact.email": 1 },
  { unique: false }
);
vendorCustomerSchema.index(
  { vendor: 1, "contact.phone": 1 },
  { unique: false }
);

vendorCustomerSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("VendorCustomer", vendorCustomerSchema);
