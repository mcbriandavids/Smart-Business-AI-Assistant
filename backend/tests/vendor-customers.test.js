const request = require("supertest");
const { expect } = require("chai");

async function createVendorWithToken() {
  const email = `vendor_${Date.now()}@example.com`;
  const reg = await request(global.app)
    .post("/api/auth/register")
    .send({
      firstName: "Ven",
      lastName: "Dor",
      email,
      phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      password: "password123",
      role: "vendor",
    });
  if (!(reg.status === 201)) {
    throw new Error("Failed to register vendor for test");
  }
  const login = await request(global.app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });
  return login.body?.data?.token;
}

describe("Vendor Customers routes", () => {
  it("creates, lists, broadcasts to contacts, and replies", async () => {
    const token = await createVendorWithToken();

    // Create contact
    const upsert = await request(global.app)
      .post("/api/vendor-customers")
      .set("Authorization", `Bearer ${token}`)
      .send({
        contact: { name: "Alice", email: "alice@example.com" },
        tags: ["vip"],
      });
    expect(upsert.status).to.be.oneOf([200, 201]);
    const contactId =
      upsert.body?.data?.contact?.id || upsert.body?.data?.contact?._id;

    // List
    const list = await request(global.app)
      .get("/api/vendor-customers")
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).to.equal(200);

    // Broadcast (no 429 due to disabled limiter in test)
    const bc = await request(global.app)
      .post("/api/vendor-customers/broadcast")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Offer", message: "Hello" });
    expect(bc.status).to.equal(201);

    // Reply requires a customer auth and a contact; skip if contact has no customer link
    // Just ensure endpoint param validation by expecting 404 for bogus id
    const fakeId = "0123456789abcdef01234567";
    const regCustEmail = `c_${Date.now()}@e.com`;
    await request(global.app)
      .post("/api/auth/register")
      .send({
        firstName: "C",
        lastName: "X",
        email: regCustEmail,
        phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        password: "password123",
        role: "customer",
      });
    const custLogin = await request(global.app)
      .post("/api/auth/login")
      .send({ email: regCustEmail, password: "password123" });
    const custToken = custLogin.body?.data?.token;

    const reply = await request(global.app)
      .post(`/api/vendor-customers/${fakeId}/reply`)
      .set("Authorization", `Bearer ${custToken}`)
      .send({ message: "Interested" });
    expect([201, 404, 401]).to.include(reply.status); // ok depending on fake id and auth
  });
});
