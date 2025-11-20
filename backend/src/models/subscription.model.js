/**
 * Subscription Model
 * ------------------
 * Tracks vendor subscription plans, billing information, and usage metrics.
 */
const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
  {
    messagesSent: { type: Number, default: 0 },
    toolCalls: { type: Number, default: 0 },
    broadcasts: { type: Number, default: 0 },
    storageMb: { type: Number, default: 0 },
  },
  { _id: false }
);

const limitsSchema = new mongoose.Schema(
  {
    monthlyMessages: { type: Number, default: 500 },
    monthlyToolCalls: { type: Number, default: 500 },
    seats: { type: Number, default: 1 },
    storageMb: { type: Number, default: 1024 },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: [
        "free",
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "semiannual",
        "annual",
      ],
      default: "free",
    },
    status: {
      type: String,
      enum: ["trial", "active", "grace", "past_due", "canceled"],
      default: "trial",
      index: true,
    },
    startsAt: { type: Date, default: Date.now },
    renewsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    canceledAt: { type: Date, default: null },
    billingProvider: { type: String, default: null },
    billingCustomerId: { type: String, default: null },
    paymentMethodId: { type: String, default: null },
    lastInvoiceId: { type: String, default: null },
    usage: { type: usageSchema, default: () => ({}) },
    limits: { type: limitsSchema, default: () => ({}) },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

subscriptionSchema.index({ plan: 1, status: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);
