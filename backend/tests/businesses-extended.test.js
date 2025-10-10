const { expect } = require("chai");
const request = require("supertest");

let app;
let vendorToken;
let businessId;

// Reuse global app from tests/setup.js
before(async function () {
  this.timeout(20000);
  app = global.app;

  // Register vendor
  const vendorRes = await request(app)
    .post("/api/auth/register")
    .send({
      firstName: "Biz",
      lastName: "Owner",
      email: `vendor_${Date.now()}@example.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      password: "password123",
      role: "vendor",
    })
    .expect(201);
  vendorToken = vendorRes.body.data.token;

  // Create a business with known location/category/hours
  const now = new Date();
  const currentDay = now
    .toLocaleDateString("en", { weekday: "long" })
    .toLowerCase();
  const openTime = new Date(now.getTime() - 60 * 60000)
    .toTimeString()
    .slice(0, 5);
  const closeTime = new Date(now.getTime() + 60 * 60000)
    .toTimeString()
    .slice(0, 5);

  const businessHours = {
    monday: { open: openTime, close: closeTime, closed: false },
    tuesday: { open: openTime, close: closeTime, closed: false },
    wednesday: { open: openTime, close: closeTime, closed: false },
    thursday: { open: openTime, close: closeTime, closed: false },
    friday: { open: openTime, close: closeTime, closed: false },
    saturday: { open: openTime, close: closeTime, closed: false },
    sunday: { open: openTime, close: closeTime, closed: false },
  };
  businessHours[currentDay] = {
    open: openTime,
    close: closeTime,
    closed: false,
  };

  const bizRes = await request(app)
    .post("/api/businesses")
    .set("Authorization", `Bearer ${vendorToken}`)
    .send({
      name: "Test Coffee",
      description: "Great coffee and snacks available",
      category: "restaurant",
      address: {
        street: "350 5th Ave",
        city: "New York",
        state: "NY",
        zipCode: "10118",
        country: "US",
        coordinates: { lat: 40.748514, lng: -73.985664 },
      },
      contact: {
        email: `coffee_${Date.now()}@example.com`,
        phone: "+12125550123",
      },
      businessHours,
    })
    .expect(201);
  businessId = bizRes.body.data.business?._id || bizRes.body.data.business?.id;
});

describe("Businesses - extended endpoints", function () {
  it("should list categories including restaurant", async function () {
    const res = await request(app)
      .get("/api/businesses/categories/list")
      .expect(200);
    expect(res.body).to.have.property("data");
    const cats = res.body.data.categories;
    expect(cats).to.be.an("array");
    expect(cats.map((c) => String(c).toLowerCase())).to.include("restaurant");
  });

  it("should return status for a business (open/closed)", async function () {
    const res = await request(app)
      .get(`/api/businesses/${businessId}/status`)
      .expect(200);
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.have.property("isOpen");
  });

  it("should find nearby businesses within ~2km of provided coords", async function () {
    // Use coords near the provided business (Manhattan)
    const longitude = -73.9851;
    const latitude = 40.7484;
    const res = await request(app)
      .get(`/api/businesses/nearby/${longitude}/${latitude}`)
      .query({ maxDistanceKm: 2 })
      .expect(200);
    expect(res.body).to.have.property("data");
    expect(res.body.data.businesses).to.be.an("array");
    expect(
      res.body.data.businesses.find(
        (b) =>
          (b._id || b.id) === businessId ||
          (b.business && (b.business._id || b.business.id) === businessId)
      )
    ).to.exist;
  });
});
