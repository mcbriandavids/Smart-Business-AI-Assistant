const request = require("supertest");
const { expect } = require("chai");
const User = require("../src/models/user.model");
const {
  getLastPasswordResetPayload,
} = require("../src/services/email.service");

describe("Password reset flow", () => {
  const base = "/api/auth";

  it("sends reset instructions and updates password", async () => {
    const email = `reset_${Date.now()}@example.com`;

    const registerResponse = await request(global.app)
      .post(`${base}/register`)
      .send({
        firstName: "Reset",
        lastName: "Tester",
        email,
        phone: "+12223334444",
        password: "initialPass1",
        role: "customer",
      });

    expect(registerResponse.status).to.equal(201);

    const forgotResponse = await request(global.app)
      .post(`${base}/forgot-password`)
      .send({ email });

    expect(forgotResponse.status).to.equal(200);
    expect(forgotResponse.body?.success).to.equal(true);

    const capture = getLastPasswordResetPayload();
    expect(capture, "reset email payload").to.exist;
    expect(capture.to).to.equal(email.toLowerCase());
    expect(capture.token).to.be.a("string");

    const resetResponse = await request(global.app)
      .post(`${base}/reset-password`)
      .send({ token: capture.token, password: "NewPass123!" });

    expect(resetResponse.status).to.equal(200);
    expect(resetResponse.body?.success).to.equal(true);

    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    expect(user.resetPasswordToken).to.not.exist;
    expect(user.resetPasswordExpire).to.not.exist;

    const loginResponse = await request(global.app)
      .post(`${base}/login`)
      .send({ email, password: "NewPass123!" });

    expect(loginResponse.status).to.equal(200);
    expect(loginResponse.body?.success).to.equal(true);
  });

  it("rejects invalid or expired tokens", async () => {
    const resp = await request(global.app)
      .post(`${base}/reset-password`)
      .send({ token: "bad-token", password: "Another123" });

    expect(resp.status).to.equal(400);
    expect(resp.body?.success).to.equal(false);
  });
});
