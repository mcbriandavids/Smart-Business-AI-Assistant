const request = require("supertest");
const { expect } = require("chai");
async function createAdminToken() {
  const res = await request(global.app)
    .post("/api/test/bootstrap-admin")
    .send({})
    .expect(201);
  return res.body?.data?.token;
}

async function createCustomer() {
  const email = `user_${Date.now()}_${Math.floor(
    Math.random() * 1e9
  )}@example.com`;
  const reg = await request(global.app)
    .post("/api/auth/register")
    .send({
      firstName: "User",
      lastName: "One",
      email,
      phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      password: "password123",
      role: "customer",
    });
  const id = reg.body?.data?.user?.id || reg.body?.data?.user?._id;
  return { id, email };
}

describe("Admin routes", () => {
  it("returns stats, lists users, toggles active, and gets user stats overview", async () => {
    const adminToken = await createAdminToken();

    // Create a couple of users
    const u1 = await createCustomer();
    const u2 = await createCustomer();

    // GET /api/admin/stats
    const stats = await request(global.app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(stats.status).to.equal(200);
    expect(stats.body?.data).to.have.keys([
      "users",
      "vendors",
      "businesses",
      "orders",
    ]);

    // GET /api/admin/users
    const list = await request(global.app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(list.status).to.equal(200);
    expect(list.body?.data?.users).to.be.an("array");

    // PUT /api/admin/users/:id/toggle-active
    const toggle = await request(global.app)
      .put(`/api/admin/users/${u1.id}/toggle-active`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(toggle.status).to.equal(200);

    // GET /api/users/stats/overview (admin only)
    const overview = await request(global.app)
      .get("/api/users/stats/overview")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(overview.status).to.equal(200);
    expect(overview.body?.data?.overview).to.have.keys([
      "totalUsers",
      "customers",
      "vendors",
      "admins",
      "verifiedUsers",
      "activeUsers",
    ]);
  });
});
