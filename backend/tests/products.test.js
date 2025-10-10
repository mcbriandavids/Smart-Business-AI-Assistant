const request = require("supertest");
const { expect } = require("chai");

// Helper to create a vendor and business
async function createVendorAndBusiness() {
  const email = `vendor_${Date.now()}@example.com`;
  const reg = await request(global.app).post("/api/auth/register").send({
    firstName: "Ven",
    lastName: "Dor",
    email,
    phone: "+18888888881",
    password: "password123",
    role: "vendor",
  });
  expect(reg.status).to.equal(201);
  const login = await request(global.app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });
  const token = login.body?.data?.token;
  expect(token).to.be.ok;

  const biz = await request(global.app)
    .post("/api/businesses")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Biz P",
      description: "Product Biz",
      category: "restaurant",
      address: {
        street: "1 St",
        city: "C",
        state: "S",
        zipCode: "00000",
        country: "US",
        coordinates: { lat: 40.7128, lng: -74.006 },
      },
      contact: { email: "bizp@example.com", phone: "+17777777771" },
    });
  expect(biz.status).to.equal(201);
  const businessId =
    biz.body?.data?.business?.id || biz.body?.data?.business?._id;
  return { token, businessId };
}

describe("Products routes", () => {
  it("creates, lists, fetches, updates, toggles and deletes a product", async () => {
    const { token } = await createVendorAndBusiness();

    // Create product
    const create = await request(global.app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Burger",
        description: "Tasty",
        category: "food_beverages",
        price: { regular: 10 },
        inventory: { quantity: 10, trackInventory: true },
        images: [{ url: "http://img" }],
      });
    expect(create.status).to.equal(201);
    const productId =
      create.body?.data?.product?.id || create.body?.data?.product?._id;

    // List
    const list = await request(global.app).get("/api/products");
    expect(list.status).to.equal(200);
    expect(list.body?.data?.products).to.be.an("array");

    // Get by id
    const get = await request(global.app).get(`/api/products/${productId}`);
    expect(get.status).to.equal(200);

    // Update
    const upd = await request(global.app)
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isFeatured: true });
    expect(upd.status).to.equal(200);
    expect(upd.body?.data?.product?.isFeatured).to.equal(true);

    // Toggle active
    const tog = await request(global.app)
      .put(`/api/products/${productId}/toggle-active`)
      .set("Authorization", `Bearer ${token}`);
    expect(tog.status).to.equal(200);

    // Delete
    const del = await request(global.app)
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).to.equal(200);
  });
});
