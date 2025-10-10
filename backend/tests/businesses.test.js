const request = require("supertest");
const { expect } = require("chai");

let vendorToken;

before(async () => {
  // create vendor
  const email = `vendor_${Date.now()}@example.com`;
  const reg = await request(global.app).post("/api/auth/register").send({
    firstName: "Ven",
    lastName: "Dor",
    email,
    phone: "+18888888888",
    password: "password123",
    role: "vendor",
  });
  expect(reg.status).to.equal(201);
  const login = await request(global.app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });
  vendorToken = login.body?.data?.token;
  expect(vendorToken).to.be.ok;
});

describe("Businesses routes", () => {
  it("creates and fetches a business", async () => {
    const create = await request(global.app)
      .post("/api/businesses")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        name: "Test Biz",
        description: "A valid description",
        category: "restaurant",
        address: {
          street: "1 St",
          city: "C",
          state: "S",
          zipCode: "00000",
          country: "US",
          coordinates: { lat: 40.7128, lng: -74.006 },
        },
        contact: { email: "biz@example.com", phone: "+17777777777" },
        businessHours: { monday: { open: "09:00", close: "17:00" } },
        services: { delivery: { enabled: true, radius: 5, fee: 2 } },
        paymentMethods: ["cash"],
      });
    expect(create.status).to.equal(201);

    const id =
      create.body?.data?.business?._id || create.body?.data?.business?.id;

    const get = await request(global.app).get(`/api/businesses/${id}`);
    expect(get.status).to.equal(200);
    expect(get.body?.data?.business?.name).to.equal("Test Biz");
  });
});
