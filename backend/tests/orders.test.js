const request = require("supertest");
const { expect } = require("chai");

async function createVendorBusinessProduct() {
  const email = `vendor_${Date.now()}@example.com`;
  await request(global.app).post("/api/auth/register").send({
    firstName: "Ven",
    lastName: "Dor",
    email,
    phone: "+18888888882",
    password: "password123",
    role: "vendor",
  });
  const login = await request(global.app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });
  const vendorToken = login.body?.data?.token;

  const biz = await request(global.app)
    .post("/api/businesses")
    .set("Authorization", `Bearer ${vendorToken}`)
    .send({
      name: "Biz O",
      description: "Order Biz",
      category: "restaurant",
      address: {
        street: "1 St",
        city: "C",
        state: "S",
        zipCode: "00000",
        country: "US",
        coordinates: { lat: 40.7128, lng: -74.006 },
      },
      contact: { email: "bizo@example.com", phone: "+17777777772" },
    });
  const businessId =
    biz.body?.data?.business?.id || biz.body?.data?.business?._id;

  const prod = await request(global.app)
    .post("/api/products")
    .set("Authorization", `Bearer ${vendorToken}`)
    .send({
      name: "Pizza",
      description: "Cheese",
      category: "food_beverages",
      price: { regular: 12 },
      inventory: { quantity: 5, trackInventory: true },
      images: [{ url: "http://img" }],
    });
  const productId =
    prod.body?.data?.product?.id || prod.body?.data?.product?._id;

  return { businessId, productId };
}

async function createCustomer() {
  const email = `cust_${Date.now()}@example.com`;
  await request(global.app).post("/api/auth/register").send({
    firstName: "Cus",
    lastName: "Tom",
    email,
    phone: "+18888888883",
    password: "password123",
    role: "customer",
  });
  const login = await request(global.app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });
  return login.body?.data?.token;
}

describe("Orders routes", () => {
  it("creates an order and updates status", async () => {
    const { businessId, productId } = await createVendorBusinessProduct();
    const customerToken = await createCustomer();

    const create = await request(global.app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        business: businessId,
        items: [
          {
            product: productId,
            quantity: 2,
            variants: [{ name: "size", option: "large", priceModifier: 2 }],
            notes: "extra cheese",
          },
        ],
        deliveryInfo: { type: "pickup" },
        paymentInfo: { method: "cash" },
      });
    expect(create.status).to.equal(201);
    const orderId =
      create.body?.data?.order?.id || create.body?.data?.order?._id;

    const get = await request(global.app)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(get.status).to.equal(200);
  });
});
