/**
 * Notification Model
 * ------------------
 * Represents user-facing notifications with multi-channel metadata.
 */
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "order_placed",
        "order_confirmed",
        "order_rejected",
        "order_preparing",
        "order_ready",
        "order_out_for_delivery",
        "order_delivered",
        "order_cancelled",
        "payment_received",
        "payment_failed",
        "new_customer",
        "product_low_stock",
        "business_verification",
        "system_announcement",
        "announcement",
        "ai_suggestion",
        "other",
      ],
      required: true,
    },
    title: { type: String, required: true, maxlength: 100 },
    message: { type: String, required: true, maxlength: 500 },
    data: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      customData: mongoose.Schema.Types.Mixed,
    },
    channels: {
      push: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
      },
      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
        emailId: String,
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
        messageId: String,
      },
      inApp: {
        sent: { type: Boolean, default: true },
        sentAt: { type: Date, default: Date.now },
      },
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read", "failed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    actionUrl: String,
    expiresAt: Date,
    retryCount: { type: Number, default: 0, max: 3 },
    scheduledFor: Date,
    template: { name: String, variables: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

notificationSchema.virtual("deliveryStatus").get(function () {
  const channels = this.channels;
  const totalChannels = Object.keys(channels).filter(
    (channel) => channels[channel].sent || channel === "inApp"
  ).length;
  if (totalChannels === 0) return "pending";
  const sentChannels = Object.keys(channels).filter(
    (channel) => channels[channel].sent
  ).length;
  if (sentChannels === totalChannels) return "delivered";
  if (sentChannels > 0) return "partial";
  return "failed";
});

notificationSchema.methods.markAsRead = function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    this.status = "read";
    return this.save();
  }
  return Promise.resolve(this);
};

notificationSchema.methods.isExpired = function () {
  return this.expiresAt && new Date() > this.expiresAt;
};

notificationSchema.methods.updateChannelStatus = function (
  channel,
  success,
  error = null,
  externalId = null
) {
  if (!this.channels[channel]) return;
  this.channels[channel].sent = success;
  this.channels[channel].sentAt = new Date();
  if (error) this.channels[channel].error = error;
  if (externalId) {
    if (channel === "email") this.channels[channel].emailId = externalId;
    else if (channel === "sms") this.channels[channel].messageId = externalId;
  }
  const allChannelsSent = Object.values(this.channels).every((ch) => ch.sent);
  if (allChannelsSent) this.status = "delivered";
  else if (success) this.status = "sent";
  else {
    this.retryCount += 1;
    if (this.retryCount >= 3) this.status = "failed";
  }
  return this.save();
};

notificationSchema.statics.createFromTemplate = async function (
  templateName,
  recipient,
  data
) {
  const templates = {
    order_placed: {
      title: "New Order Received",
      message:
        "You have received a new order #{orderNumber} from {customerName}",
      type: "order_placed",
      priority: "high",
    },
    order_confirmed: {
      title: "Order Confirmed",
      message:
        "Your order #{orderNumber} has been confirmed and is being prepared",
      type: "order_confirmed",
      priority: "normal",
    },
    order_ready: {
      title: "Order Ready",
      message: "Your order #{orderNumber} is ready for {deliveryType}",
      type: "order_ready",
      priority: "high",
    },
  };
  const template = templates[templateName];
  if (!template) throw new Error(`Template ${templateName} not found`);
  let title = template.title;
  let message = template.message;
  Object.keys(data).forEach((key) => {
    const value = data[key];
    title = title.replace(new RegExp(`{${key}}`, "g"), value);
    message = message.replace(new RegExp(`{${key}}`, "g"), value);
  });
  return this.create({
    recipient,
    type: template.type,
    title,
    message,
    priority: template.priority,
    data,
    template: { name: templateName, variables: data },
  });
};

notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  });
};

notificationSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
