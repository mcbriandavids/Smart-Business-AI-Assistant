/**
 * Product Model
 * -------------
 * Describes catalog items sold by a business, including price, inventory,
 * availability windows, variants, SEO, analytics, and search indexes.
 */
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    category: {
      type: String,
      required: true,
      enum: [
        "food_beverages",
        "electronics",
        "clothing_accessories",
        "health_beauty",
        "home_garden",
        "sports_outdoors",
        "books_media",
        "toys_games",
        "automotive",
        "office_supplies",
        "services",
        "other",
      ],
    },
    subcategory: { type: String, trim: true },
    images: [
      {
        url: { type: String, required: true },
        caption: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    price: {
      regular: { type: Number, required: true, min: 0 },
      sale: { type: Number, min: 0 },
      currency: { type: String, default: "USD" },
    },
    inventory: {
      inStock: { type: Boolean, default: true },
      quantity: { type: Number, default: 0, min: 0 },
      lowStockThreshold: { type: Number, default: 5 },
      trackInventory: { type: Boolean, default: true },
    },
    specifications: {
      weight: {
        value: Number,
        unit: { type: String, enum: ["g", "kg", "oz", "lb"] },
      },
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: { type: String, enum: ["cm", "in", "m"] },
      },
      color: [String],
      size: [String],
      material: String,
      brand: String,
      model: String,
      sku: String,
    },
    variants: [{ name: String, options: [String], priceModifier: Number }],
    availability: {
      isAvailable: { type: Boolean, default: true },
      preparationTime: { type: String, default: "15-30 minutes" },
      availableDays: [
        {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
      ],
      availableHours: { start: String, end: String },
    },
    tags: [String],
    features: [String],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    analytics: {
      views: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      wishlistCount: { type: Number, default: 0 },
    },
    seo: { metaTitle: String, metaDescription: String, keywords: [String] },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ business: 1 });
productSchema.index({ category: 1 });
productSchema.index({ "price.regular": 1 });
productSchema.index({ "rating.average": -1 });
productSchema.index({ isActive: 1, "availability.isAvailable": 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

productSchema.virtual("effectivePrice").get(function () {
  return this.price.sale && this.price.sale < this.price.regular
    ? this.price.sale
    : this.price.regular;
});

productSchema.virtual("discountPercentage").get(function () {
  if (!this.price.sale || this.price.sale >= this.price.regular) return 0;
  return Math.round(
    ((this.price.regular - this.price.sale) / this.price.regular) * 100
  );
});

productSchema.virtual("isLowStock").get(function () {
  return (
    this.inventory.trackInventory &&
    this.inventory.quantity <= this.inventory.lowStockThreshold
  );
});

productSchema.methods.isAvailableNow = function () {
  if (!this.availability.isAvailable || !this.isActive) return false;
  const now = new Date();
  const currentDay = now
    .toLocaleDateString("en", { weekday: "long" })
    .toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  if (
    this.availability.availableDays.length > 0 &&
    !this.availability.availableDays.includes(currentDay)
  )
    return false;
  if (
    this.availability.availableHours.start &&
    this.availability.availableHours.end
  ) {
    return (
      currentTime >= this.availability.availableHours.start &&
      currentTime <= this.availability.availableHours.end
    );
  }
  return true;
};

productSchema.methods.updateInventory = function (quantityOrdered) {
  if (this.inventory.trackInventory) {
    this.inventory.quantity = Math.max(
      0,
      this.inventory.quantity - quantityOrdered
    );
    this.inventory.inStock = this.inventory.quantity > 0;
  }
  this.analytics.orders += 1;
  return this.save();
};

productSchema.methods.incrementViews = function () {
  this.analytics.views += 1;
  return this.save({ validateBeforeSave: false });
};

productSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Product", productSchema);
