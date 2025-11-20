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
    preferredChannel: {
      type: String,
      enum: ["sms", "email", "in_app", "whatsapp"],
      default: "in_app",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    lifecycleStage: {
      type: String,
      enum: ["lead", "prospect", "active", "churn_risk", "dormant"],
      default: "lead",
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: { type: String, maxlength: 500 },
      lastRatedAt: Date,
    },
    lastInteractionAt: Date,
    lifetimeValue: { type: Number, default: 0 },
    messages: [
      {
        content: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ["product", "price", "general"],
          default: "general",
        },
        channel: {
          type: String,
          enum: ["sms", "email", "in_app", "whatsapp", "agent_note"],
          default: "in_app",
        },
        metadata: { type: Object, default: {} },
      },
    ],
    agentSummary: {
      type: String,
      default: null,
    },
    agentRecommendations: {
      nextBestAction: { type: String, default: null },
      generatedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customer);
