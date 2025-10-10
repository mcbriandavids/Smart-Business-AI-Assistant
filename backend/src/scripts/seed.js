/**
 * Seed Script
 * -----------
 * Populates the database with an admin, vendor, customer, a demo business, and a demo product.
 *
 * Pseudocode
 * ----------
 * connect() -> mongoose.connect
 * ensureUser(): find or create user with role
 * ensureBusinessForVendor(): find or create business for vendor
 * ensureProduct(): find or create a demo product for the business
 * run(): connect -> ensure admin/vendor/customer -> ensure business/product -> disconnect
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Business = require("../models/business.model");
const Product = require("../models/product.model");

async function connect() {
  const mongoURI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/smart-business-ai";
  await mongoose.connect(mongoURI);
  console.log("Connected to MongoDB");
}

async function ensureUser({
  firstName,
  lastName,
  email,
  phone,
  password,
  role,
}) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      isVerified: true,
    });
    console.log(`Created ${role} user: ${email}`);
  } else {
    console.log(`User exists: ${email}`);
  }
  return user;
}

async function ensureBusinessForVendor(vendor) {
  let business = await Business.findOne({ owner: vendor._id });
  if (!business) {
    business = await Business.create({
      owner: vendor._id,
      name: "Demo Deli",
      description: "A demo business for testing the Smart Business AI API",
      category: "restaurant",
      contact: {
        email: "demo@deli.test",
        phone: "+10000000000",
        website: "https://example.com",
      },
      address: {
        street: "123 Main St",
        city: "Demo City",
        state: "DC",
        zipCode: "00000",
        country: "US",
        coordinates: { lat: 37.7749, lng: -122.4194 },
      },
      businessHours: {
        monday: { open: "09:00", close: "17:00" },
        tuesday: { open: "09:00", close: "17:00" },
        wednesday: { open: "09:00", close: "17:00" },
        thursday: { open: "09:00", close: "17:00" },
        friday: { open: "09:00", close: "17:00" },
        saturday: { open: "10:00", close: "16:00" },
        sunday: { closed: true },
      },
      services: {
        delivery: {
          enabled: true,
          radius: 10,
          fee: 3,
          estimatedTime: "30-45 minutes",
        },
        pickup: { enabled: true },
      },
      paymentMethods: ["cash", "card"],
    });
    console.log("Created demo business");
  } else {
    console.log("Vendor already has a business");
  }
  return business;
}

async function ensureProduct(business) {
  const existing = await Product.findOne({
    business: business._id,
    name: "Demo Sandwich",
  });
  if (!existing) {
    await Product.create({
      business: business._id,
      name: "Demo Sandwich",
      description: "Tasty demo sandwich with fresh ingredients",
      category: "food_beverages",
      images: [{ url: "https://via.placeholder.com/300", caption: "Demo" }],
      price: { regular: 9.99, currency: "USD" },
      inventory: { trackInventory: true, quantity: 25, inStock: true },
      tags: ["demo", "sandwich"],
      availability: { isAvailable: true },
    });
    console.log("Created demo product");
  } else {
    console.log("Demo product already exists");
  }
}

async function run() {
  try {
    await connect();

    const admin = await ensureUser({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      phone: "+10000000001",
      password: "password123",
      role: "admin",
    });

    const vendor = await ensureUser({
      firstName: "Vendor",
      lastName: "User",
      email: "vendor@example.com",
      phone: "+10000000002",
      password: "password123",
      role: "vendor",
    });

    const customer = await ensureUser({
      firstName: "Customer",
      lastName: "User",
      email: "customer@example.com",
      phone: "+10000000003",
      password: "password123",
      role: "customer",
    });

    const business = await ensureBusinessForVendor(vendor);
    await ensureProduct(business);

    console.log("Seeding complete");
  } catch (e) {
    console.error("Seed error:", e);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

run();
