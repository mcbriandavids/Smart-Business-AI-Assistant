/**
 * AgentToolAudit Model
 * --------------------
 * Tracks each tool execution performed by the AI agent for compliance and review.
 */
const mongoose = require("mongoose");

const agentToolAuditSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgentConversation",
      required: true,
      index: true,
    },
    toolName: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "error"],
      default: "success",
    },
    args: {
      type: Object,
      default: {},
    },
    result: {
      type: Object,
      default: {},
    },
    error: {
      type: Object,
      default: null,
    },
    executedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

agentToolAuditSchema.index({ vendor: 1, executedAt: -1 });

module.exports = mongoose.model("AgentToolAudit", agentToolAuditSchema);
