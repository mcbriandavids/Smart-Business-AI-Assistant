/**
 * Order Model
 * -----------
 * Captures the full lifecycle and pricing breakdown of a customer order
 * for a given business, including status timeline and payment info.
 */
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      },
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        variants: [{ name: String, option: String, priceModifier: Number }],
        subtotal: { type: Number, required: true },
        notes: String,
      },
    ],
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      serviceCharge: { type: Number, default: 0, min: 0 },
      deliveryFee: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    deliveryInfo: {
      type: { type: String, enum: ["delivery", "pickup"], required: true },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        coordinates: { lat: Number, lng: Number },
        instructions: String,
      },
      estimatedTime: String,
      actualTime: String,
      distance: Number,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "rejected",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    timeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    paymentInfo: {
      method: {
        type: String,
        enum: ["cash", "card", "mobile_money", "bank_transfer", "crypto"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: String,
      paidAt: Date,
      refundedAt: Date,
    },
    customerNotes: String,
    vendorNotes: String,
    rating: {
      customer: {
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        ratedAt: Date,
      },
      vendor: {
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        ratedAt: Date,
      },
    },
    aiSuggestions: {
      orderOptimization: String,
      deliveryRoute: String,
      customerPreferences: [String],
    },
    metadata: {
      source: {
        type: String,
        enum: ["web", "mobile", "api", "ai_agent"],
        default: "web",
      },
      userAgent: String,
      ipAddress: String,
      sessionId: String,
    },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ business: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ "paymentInfo.status": 1 });

orderSchema.virtual("ageInMinutes").get(function () {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60));
});

orderSchema.pre("save", function (next) {
  if (
    this.isModified("items") ||
    this.isModified("pricing.serviceCharge") ||
    this.isModified("pricing.deliveryFee") ||
    this.isModified("pricing.tax") ||
    this.isModified("pricing.discount")
  ) {
    this.pricing.subtotal = this.items.reduce(
      (total, item) => total + item.subtotal,
      0
    );
    this.pricing.total =
      this.pricing.subtotal +
      this.pricing.serviceCharge +
      this.pricing.deliveryFee +
      this.pricing.tax -
      this.pricing.discount;
  }
  next();
});

orderSchema.methods.updateStatus = function (
  newStatus,
  note = "",
  updatedBy = null
) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy,
  });
  if (newStatus === "delivered" && this.paymentInfo.method === "cash") {
    this.paymentInfo.status = "paid";
    this.paymentInfo.paidAt = new Date();
  }
  return this.save();
};

orderSchema.methods.calculateEstimatedDeliveryTime = function () {
  if (this.deliveryInfo.type === "pickup") return "15-30 minutes";
  const basePrep = 20;
  const deliveryTime = Math.ceil((this.deliveryInfo.distance || 0) * 3);
  const total = basePrep + deliveryTime;
  return `${total - 5}-${total + 10} minutes`;
};

orderSchema.methods.canBeCancelled = function () {
  return ["pending", "confirmed"].includes(this.status);
};

orderSchema.methods.canBeRated = function () {
  return this.status === "completed" || this.status === "delivered";
};

orderSchema.statics.getBusinessOrdersByStatus = function (businessId, status) {
  return this.find({ business: businessId, status })
    .populate("customer", "firstName lastName phone")
    .populate("items.product", "name images")
    .sort({ createdAt: -1 });
};

orderSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Order", orderSchema);
