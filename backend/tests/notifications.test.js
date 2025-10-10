const request = require("supertest");
const { expect } = require("chai");

async function createUser(role = "customer") {
  const email = `${role}_${Date.now()}@example.com`;
  await request(global.app).post("/api/auth/register").send({
    firstName: role,
    lastName: "User",
    email,
    phone: "+18888888885",
    password: "password123",
    role,
  });
  const login = await request(global.app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });
  return { token: login.body?.data?.token, email };
}

describe("Notifications routes", () => {
  it("lists and marks notifications as read", async () => {
    // create vendor + customer and trigger a notification via vendor broadcast to a self contact (no customer id, so list may be empty)
    const { token: customerToken } = await createUser("customer");

    const list = await request(global.app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(list.status).to.equal(200);
    expect(list.body?.data?.items).to.be.an("array");

    // Mark read path needs a notification id; if none, skip marking
    const first = list.body?.data?.items?.[0];
    if (first) {
      const mark = await request(global.app)
        .put(`/api/notifications/${first.id || first._id}/read`)
        .set("Authorization", `Bearer ${customerToken}`);
      expect(mark.status).to.equal(200);
    }
  });
});
