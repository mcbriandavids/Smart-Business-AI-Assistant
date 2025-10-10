const { expect } = require("chai");
const request = require("supertest");

let app;
let vendorToken;
let adminToken;
let customerToken;
let businessId;
let productId;
let orderId;

before(async function () {
  this.timeout(30000);
  app = global.app;

  // Vendor
  const vendorRes = await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Vend",
      lastName: "Or",
      email: `vendor_os_${Date.now()}@example.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      password: "password123",
      role: "vendor",
    })
    .expect(201);
  vendorToken = vendorRes.body.data.token;

  // Admin via bootstrap helper
  const adminRes = await request(app)
    .post("/api/test/bootstrap-admin")
    .send({})
    .expect(201);
  adminToken = adminRes.body.data.token;

  // Customer
  const custRes = await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Cust",
      lastName: "Omer",
      email: `customer_os_${Date.now()}@example.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      password: "password123",
    })
    .expect(201);
  customerToken = custRes.body.data.token;

  // Business
  const bizRes = await request(app)
    .post("/api/businesses")
    .set("Authorization", `Bearer ${vendorToken}`)
    .send({
      name: "Order Flow Cafe",
      description: "Coffee shop testing order flow",
      category: "restaurant",
      address: {
        street: "350 5th Ave",
        city: "New York",
        state: "NY",
        zipCode: "10118",
        country: "US",
        coordinates: { lat: 40.748514, lng: -73.985664 },
      },
      contact: {
        email: `orderflow_${Date.now()}@example.com`,
        phone: "+12125550124",
      },
    })
    .expect(201);
  businessId = bizRes.body.data.business?._id || bizRes.body.data.business?.id;

  // Product
  const prodRes = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${vendorToken}`)
    .send({
      name: "Latte",
      description: "Hot latte",
      category: "food_beverages",
      price: { regular: 4.5 },
      inventory: { quantity: 10, trackInventory: true },
      images: [{ url: "http://img" }],
    })
    .expect(201);
  productId = prodRes.body.data.product?._id || prodRes.body.data.product?.id;

  // Order by customer
  const orderRes = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${customerToken}`)
    .send({
      items: [{ product: productId, quantity: 2 }],
      business: businessId,
      deliveryInfo: { type: "pickup" },
      paymentInfo: { method: "cash" },
    })
    .expect(201);
  orderId = orderRes.body.data.order?._id || orderRes.body.data.order?.id;
});

describe("Orders - status update flow", function () {
  it("vendor should update order status to confirmed", async function () {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ status: "confirmed" })
      .expect(200);
    expect(res.body.data.order.status).to.equal("confirmed");
  });

  it("admin should update order status to preparing", async function () {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "preparing" })
      .expect(200);
    expect(res.body.data.order.status).to.equal("preparing");
  });
});
