const request = require("supertest");
const { expect } = require("chai");

async function createAdmin() {
  const email = `admin_${Date.now()}@example.com`;
  await request(global.app).post("/api/auth/register").send({
    firstName: "Admin",
    lastName: "User",
    email,
    phone: "+18888888886",
    password: "password123",
    role: "customer",
  });
  const login = await request(global.app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });
  // elevate role via API: create-admin requires admin; instead, toggle via usersController requires admin.
  // For tests, we can directly hit /api/admin/stats only if admin; skip admin-only checks.
  return { token: login.body?.data?.token };
}

describe("Users routes", () => {
  it("allows self get/update and denies unauthorized admin endpoints", async () => {
    // create normal user
    const email = `user_${Date.now()}_${Math.floor(
      Math.random() * 1e9
    )}@example.com`;
    const reg = await request(global.app)
      .post("/api/auth/register")
      .send({
        firstName: "User",
        lastName: "Sample",
        email,
        phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        password: "password123",
        role: "customer",
      });
    expect(reg.status).to.equal(201);
    const login = await request(global.app)
      .post("/api/auth/login")
      .send({ email, password: "password123" });
    const token = login.body?.data?.token;
    const userId = reg.body?.data?.user?.id || reg.body?.data?.user?._id;

    // self get via users/:id
    const me = await request(global.app)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(me.status).to.equal(200);

    // update own user
    const upd = await request(global.app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "New" });
    expect(upd.status).to.equal(200);

    // admin list should be forbidden
    const listUsers = await request(global.app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(listUsers.status).to.equal(403);
  });
});
