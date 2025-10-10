const { expect } = require("chai");
const request = require("supertest");

let app;
let adminToken;
let userToken;
let userId;

before(async function () {
  this.timeout(20000);
  app = global.app;

  // Admin via bootstrap helper
  const adminRes = await request(app)
    .post("/api/test/bootstrap-admin")
    .send({})
    .expect(201);
  adminToken = adminRes.body.data.token;

  // Regular user
  const regRes = await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Note",
      lastName: "Target",
      email: `note_target_${Date.now()}@example.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      password: "password123",
    })
    .expect(201);
  userToken = regRes.body.data.token;
  userId = regRes.body.data.user.id || regRes.body.data.user._id;
});

describe("Notifications - admin announce", function () {
  it("admin can announce to specific users and they can retrieve it", async function () {
    // Admin sends an announcement
    await request(app)
      .post("/api/notifications/announce")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Maintenance Window",
        message: "The system will be down tonight 1am-2am UTC",
        recipients: [userId],
      })
      .expect(201);

    // Recipient lists notifications
    const listRes = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(listRes.body.data.items).to.be.an("array");
    const found = listRes.body.data.items.find(
      (n) => n.title === "Maintenance Window"
    );
    expect(found).to.exist;
  });

  it("non-admin cannot use announce endpoint", async function () {
    await request(app)
      .post("/api/notifications/announce")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Hello", message: "World", recipients: [] })
      .expect(403);
  });
});
