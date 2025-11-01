/**
 * Customer API Tests
 * ------------------
 * Tests for /api/customers endpoints (CRUD + messaging).
 */
const request = require("supertest");
const { createApp } = require("../src/app");
const mongoose = require("mongoose");
const assert = require("assert");

const User = require("../src/models/user.model");
const Customer = require("../src/models/customer.model");
const { generateTestToken } = require("./utils");

let app;
let server;
let vendorToken;
let vendorId;

before(async () => {
  app = createApp();
  server = app.listen();
  // Create a vendor user and get a real JWT
  const vendor = new User({
    firstName: "Test",
    lastName: "Vendor",
    email: "vendor@example.com",
    phone: "+1234567890",
    password: "password123",
    role: "vendor",
    isActive: true,
  });
  await vendor.save();
  vendorId = vendor._id;
  vendorToken = generateTestToken(vendor);
});

after(async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({});
    await Customer.deleteMany({});
    await mongoose.connection.close();
  }
  if (server && server.close) server.close();
});

describe("Customer API", () => {
  let customerId;

  it("should create a customer", async () => {
    const res = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        name: "John Doe",
        email: "john@example.com",
        phone: "+1111111111",
      });
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.data.name, "John Doe");
    customerId = res.body.data._id;
  });

  it("should get all customers", async () => {
    const res = await request(app)
      .get("/api/customers")
      .set("Authorization", `Bearer ${vendorToken}`);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  it("should get a single customer", async () => {
    const res = await request(app)
      .get(`/api/customers/${customerId}`)
      .set("Authorization", `Bearer ${vendorToken}`);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data._id, customerId);
  });

  it("should update a customer", async () => {
    const res = await request(app)
      .put(`/api/customers/${customerId}`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ notes: "VIP customer" });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.notes, "VIP customer");
  });

  it("should send a message to a customer", async () => {
    const res = await request(app)
      .post(`/api/customers/${customerId}/message`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ content: "Special offer!", type: "product" });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.data.messages.length > 0);
    assert.strictEqual(res.body.data.messages[0].content, "Special offer!");
  });

  it("should delete a customer", async () => {
    const res = await request(app)
      .delete(`/api/customers/${customerId}`)
      .set("Authorization", `Bearer ${vendorToken}`);
    assert.strictEqual(res.statusCode, 200);
    assert.match(res.body.message, /deleted/i);
  });
});
