/**
 * Business Model
 * --------------
 * Captures vendor businesses with contact, address (lat/lng), hours,
 * services, payment methods, ratings, settings (free service charge by default),
 * and verification state. Includes geospatial indexes and helpers.
 */
const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Business owner is required"],
    },
    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      maxlength: [100, "Business name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Business description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Business category is required"],
      enum: [
        "restaurant",
        "grocery",
        "pharmacy",
        "electronics",
        "clothing",
        "beauty",
        "home_garden",
        "sports",
        "books",
        "toys",
        "automotive",
        "health",
        "services",
        "other",
      ],
    },
    logo: { type: String, default: null },
    images: [
      {
        url: String,
        caption: String,
      },
    ],
    contact: {
      email: {
        type: String,
        required: [true, "Business email is required"],
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email",
        ],
      },
      phone: { type: String, required: [true, "Business phone is required"] },
      website: String,
      socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String,
      },
    },
    address: {
      street: { type: String, required: [true, "Street address is required"] },
      city: { type: String, required: [true, "City is required"] },
      state: { type: String, required: [true, "State is required"] },
      zipCode: { type: String, required: [true, "Zip code is required"] },
      country: { type: String, required: [true, "Country is required"] },
      coordinates: {
        lat: { type: Number, required: [true, "Latitude is required"] },
        lng: { type: Number, required: [true, "Longitude is required"] },
      },
    },
    businessHours: {
      monday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      tuesday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      wednesday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      thursday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      friday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      saturday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      sunday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: true },
      },
    },
    services: {
      delivery: {
        enabled: { type: Boolean, default: true },
        radius: { type: Number, default: 10 },
        fee: { type: Number, default: 0 },
        estimatedTime: { type: String, default: "30-45 minutes" },
      },
      pickup: {
        enabled: { type: Boolean, default: true },
        instructions: String,
      },
    },
    paymentMethods: [
      {
        type: String,
        enum: ["cash", "card", "mobile_money", "bank_transfer", "crypto"],
      },
    ],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    settings: {
      autoAcceptOrders: { type: Boolean, default: false },
      maxOrdersPerHour: { type: Number, default: 50 },
      minimumOrderAmount: { type: Number, default: 0 },
      serviceChargePercentage: { type: Number, default: 0 },
    },
    verification: {
      isVerified: { type: Boolean, default: false },
      documents: [{ type: String, url: String, uploadedAt: Date }],
      verifiedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    isActive: { type: Boolean, default: true },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

businessSchema.index({ "address.coordinates": "2dsphere" });
businessSchema.index({ category: 1 });
businessSchema.index({ "rating.average": -1 });
businessSchema.index({ isActive: 1, isOpen: 1 });

businessSchema.virtual("fullAddress").get(function () {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

businessSchema.methods.isCurrentlyOpen = function () {
  const now = new Date();
  const day = now.toLocaleDateString("en", { weekday: "long" }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  const daySchedule = this.businessHours?.[day];
  if (!daySchedule || daySchedule.closed) return false;
  return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
};

businessSchema.methods.calculateDistance = function (customerCoords) {
  const R = 6371;
  const dLat =
    ((customerCoords.lat - this.address.coordinates.lat) * Math.PI) / 180;
  const dLon =
    ((customerCoords.lng - this.address.coordinates.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((this.address.coordinates.lat * Math.PI) / 180) *
      Math.cos((customerCoords.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

businessSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Business", businessSchema);
