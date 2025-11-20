/**
 * AgentConversation Model
 * -----------------------
 * Stores multi-turn conversations between the AI agent, vendor, and customers,
 * including tool invocations and summarised context for long-term memory.
 */
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["vendor", "customer", "agent", "tool"],
      required: true,
    },
    content: { type: String, default: "" },
    toolName: { type: String, default: null },
    toolCallId: { type: String, default: null },
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const metricsSchema = new mongoose.Schema(
  {
    totalMessages: { type: Number, default: 0 },
    agentMessages: { type: Number, default: 0 },
    vendorMessages: { type: Number, default: 0 },
    customerMessages: { type: Number, default: 0 },
  },
  { _id: false }
);

const feedbackEntrySchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["customer", "vendor", "agent", "system"],
      default: "customer",
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "", maxlength: 1000 },
    createdByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    followUpRequired: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const qaFlagSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["customer", "vendor", "agent", "system", "admin"],
      required: true,
    },
    reason: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "dismissed"],
      default: "open",
    },
    notes: { type: String, default: "", maxlength: 2000 },
    raisedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    raisedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: true }
);

const agentConversationSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    channel: {
      type: String,
      enum: ["sms", "email", "in_app", "whatsapp", "unknown"],
      default: "in_app",
    },
    status: {
      type: String,
      enum: ["active", "closed", "archived"],
      default: "active",
      index: true,
    },
    externalThreadId: { type: String, default: null },
    summary: { type: String, default: null },
    lastMessageAt: { type: Date, default: Date.now },
    memoryVectorKey: { type: String, default: null },
    tags: { type: [String], default: [] },
    metrics: { type: metricsSchema, default: () => ({}) },
    messages: {
      type: [messageSchema],
      default: [],
    },
    feedbackEntries: {
      type: [feedbackEntrySchema],
      default: [],
    },
    qaFlags: {
      type: [qaFlagSchema],
      default: [],
    },
    rating: {
      average: { type: Number, default: null, min: 1, max: 5 },
      count: { type: Number, default: 0 },
      lastRatedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

agentConversationSchema.index({ vendor: 1, customer: 1, status: 1 });
agentConversationSchema.index({ lastMessageAt: -1 });
agentConversationSchema.index({ "qaFlags.status": 1 });
agentConversationSchema.index({ "rating.average": -1 });

agentConversationSchema.methods.appendMessage = function (message) {
  this.messages.push(message);
  this.metrics = this.metrics || {};
  this.metrics.totalMessages = (this.metrics.totalMessages || 0) + 1;
  if (message.role === "agent") {
    this.metrics.agentMessages = (this.metrics.agentMessages || 0) + 1;
  }
  if (message.role === "vendor") {
    this.metrics.vendorMessages = (this.metrics.vendorMessages || 0) + 1;
  }
  if (message.role === "customer") {
    this.metrics.customerMessages = (this.metrics.customerMessages || 0) + 1;
  }
  this.lastMessageAt = message.createdAt || new Date();
  return this.save();
};

module.exports = mongoose.model("AgentConversation", agentConversationSchema);
