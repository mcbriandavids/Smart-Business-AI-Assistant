const request = require("supertest");
const { expect } = require("chai");

describe("Auth routes", () => {
  const base = "/api/auth";

  it("registers and logs in a user", async () => {
    const email = `test_${Date.now()}@example.com`;

    const register = await request(global.app).post(`${base}/register`).send({
      firstName: "Test",
      lastName: "User",
      email,
      phone: "+19999999999",
      password: "password123",
      role: "customer",
    });
    expect(register.status).to.equal(201);
    expect(register.body?.data?.user?.email).to.equal(email);
    expect(register.body?.data?.token).to.be.ok;

    const login = await request(global.app)
      .post(`${base}/login`)
      .send({ email, password: "password123" });
    expect(login.status).to.equal(200);
    expect(login.body?.data?.token).to.be.ok;
  });
});
