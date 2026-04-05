const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../app");
const User = require("../models/user");
const Host = require("../models/host");
const Renter = require("../models/renter");
const ParkingSpace = require("../models/parkingSpace");
const Booking = require("../models/booking");
const Report = require("../models/report");

function objectId() {
  return new mongoose.Types.ObjectId();
}

function uniqueEmail(prefix = "user") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@test.com`;
}

async function createHostUser() {
  return Host.create({
    email: uniqueEmail("host"),
    password: "password123",
    firstName: "Host",
    lastName: "User",
    payoutMethod: "bank",
  });
}

async function createRenterUser() {
  return Renter.create({
    email: uniqueEmail("renter"),
    password: "password123",
    firstName: "Renter",
    lastName: "User",
  });
}

async function createParkingSpaceDoc(hostId) {
  return ParkingSpace.create({
    host: hostId,
    title: "Test Garage",
    location: {
      address: "123 Test St",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
    },
    description: "Covered spot",
    parkingType: "garage",
    isPublished: true,
    maxVehicleSize: "standard",
    dailyRate: 15,
    minimumBookingDays: 1,
    availableDays: ["mon", "tue", "wed"],
    isPublished: true,
  });
}

async function createAccessToken(roleType = "User") {
  const email = uniqueEmail(roleType.toLowerCase());
  const password = "password123";

  const registerResponse = await request(app).post("/api/auth/register").send({
    email,
    password,
    firstName: "Auth",
    lastName: "User",
    roleType,
  });

  expect(registerResponse.status).toBe(201);

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  expect(loginResponse.status).toBe(200);

  return {
    token: loginResponse.body.token,
    user: loginResponse.body.user,
  };
}

function authHeader(token) {
  return `Bearer ${token}`;
}

describe("API health", () => {
  it("GET /api/health returns status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});

describe("Auth API operations", () => {
  it("registers and logs in a user with Passport", async () => {
    const email = uniqueEmail("passport");
    const password = "password123";

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email,
        password,
        firstName: "Passport",
        lastName: "User",
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.token).toBeDefined();
    expect(registerResponse.body.user.password).toBeUndefined();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
    expect(loginResponse.body.user.email).toBe(email.toLowerCase());
  });

  it("persists auth with a session cookie", async () => {
    const email = uniqueEmail("session");
    const password = "password123";
    const agent = request.agent(app);

    const registerResponse = await agent.post("/api/auth/register").send({
      email,
      password,
      firstName: "Session",
      lastName: "User",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.headers["set-cookie"]).toBeDefined();

    const meResponse = await agent.get("/api/auth/me");
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.email).toBe(email.toLowerCase());

    const logoutResponse = await agent.post("/api/auth/logout");
    expect(logoutResponse.status).toBe(204);

    const afterLogout = await agent.get("/api/auth/me");
    expect(afterLogout.status).toBe(401);
  });
});

describe("Users API operations", () => {
  it("supports create, list, get, update, delete", async () => {
    const { token } = await createAccessToken();

    const createResponse = await request(app)
      .post("/api/users")
      .set("Authorization", authHeader(token))
      .send({
        email: uniqueEmail("base"),
        password: "password123",
        firstName: "Base",
        lastName: "User",
      });

    expect(createResponse.status).toBe(201);
    const createdId = createResponse.body._id;

    const listResponse = await request(app)
      .get("/api/users")
      .set("Authorization", authHeader(token));
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.some((item) => item._id === createdId)).toBe(true);

    const getResponse = await request(app)
      .get(`/api/users/${createdId}`)
      .set("Authorization", authHeader(token));
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.firstName).toBe("Base");

    const updateResponse = await request(app)
      .put(`/api/users/${createdId}`)
      .set("Authorization", authHeader(token))
      .send({ firstName: "Updated" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.firstName).toBe("Updated");

    const deleteResponse = await request(app)
      .delete(`/api/users/${createdId}`)
      .set("Authorization", authHeader(token));
    expect(deleteResponse.status).toBe(204);

    const getDeletedResponse = await request(app)
      .get(`/api/users/${createdId}`)
      .set("Authorization", authHeader(token));
    expect(getDeletedResponse.status).toBe(404);
  });
});

describe("Parking Spaces API operations", () => {
  it("supports create, list, get, update, delete", async () => {
    const { token } = await createAccessToken("Host");
    const host = await createHostUser();

    const createResponse = await request(app)
      .post("/api/parking-spaces")
      .set("Authorization", authHeader(token))
      .send({
        host: host._id,
        title: "Downtown Spot",
        location: {
          address: "100 Pine St",
          city: "Seattle",
          state: "WA",
          zipCode: "98101",
        },
        parkingType: "garage",
        maxVehicleSize: "standard",
        dailyRate: 22,
        minimumBookingDays: 1,
        availableDays: ["mon", "tue"],
        isPublished: true,
      });

    expect(createResponse.status).toBe(201);
    const createdId = createResponse.body._id;

    const listResponse = await request(app)
      .get("/api/parking-spaces")
      .set("Authorization", authHeader(token));
    expect(listResponse.status).toBe(200);
    // For public list, only check that response is an array
    expect(Array.isArray(listResponse.body)).toBe(true);
    const foundSpace = listResponse.body.some((item) => item._id === createdId);
    expect(foundSpace).toBe(true);

    const getResponse = await request(app)
      .get(`/api/parking-spaces/${createdId}`)
      .set("Authorization", authHeader(token));
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.title).toBe("Downtown Spot");

    const updateResponse = await request(app)
      .put(`/api/parking-spaces/${createdId}`)
      .set("Authorization", authHeader(token))
      .send({ title: "Updated Spot" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.title).toBe("Updated Spot");

    const deleteResponse = await request(app)
      .delete(`/api/parking-spaces/${createdId}`)
      .set("Authorization", authHeader(token));
    expect(deleteResponse.status).toBe(204);

    const getDeletedResponse = await request(app)
      .get(`/api/parking-spaces/${createdId}`)
      .set("Authorization", authHeader(token));
    expect(getDeletedResponse.status).toBe(404);
  });
});

describe("Bookings API operations", () => {
  it("supports create, list, get, update, delete, and future filter", async () => {
    const { token: renterToken, user: renter } =
      await createAccessToken("Renter");
    const { token: hostToken, user: hostUser } =
      await createAccessToken("Host");
    const parkingSpace = await createParkingSpaceDoc(hostUser._id);

    const futureStart = new Date();
    futureStart.setDate(futureStart.getDate() + 5);
    const futureEnd = new Date();
    futureEnd.setDate(futureEnd.getDate() + 7);

    const createResponse = await request(app)
      .post("/api/bookings")
      .set("Authorization", authHeader(renterToken))
      .send({
        renter: renter._id,
        host: hostUser._id,
        parkingSpace: parkingSpace._id,
        startDate: futureStart,
        endDate: futureEnd,
        totalAmount: 45,
        status: "pending",
      });

    expect(createResponse.status).toBe(201);
    const createdId = createResponse.body._id;

    // Use /me endpoint for non-admin users instead of /
    const listResponse = await request(app)
      .get("/api/bookings/me")
      .set("Authorization", authHeader(renterToken));
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.some((item) => item._id === createdId)).toBe(true);

    const getResponse = await request(app)
      .get(`/api/bookings/${createdId}`)
      .set("Authorization", authHeader(renterToken));
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.totalAmount).toBe(45);

    const updateResponse = await request(app)
      .put(`/api/bookings/${createdId}`)
      .set("Authorization", authHeader(renterToken))
      .send({ status: "approved" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe("approved");

    const pastStart = new Date();
    pastStart.setDate(pastStart.getDate() - 5);
    const pastEnd = new Date();
    pastEnd.setDate(pastEnd.getDate() - 3);

    await Booking.create({
      renter: renter._id,
      host: hostUser._id,
      parkingSpace: parkingSpace._id,
      startDate: pastStart,
      endDate: pastEnd,
      totalAmount: 10,
      status: "completed",
    });

    // Use host token for future bookings endpoint (requires Host or Admin role and owns the parking space)
    const futureResponse = await request(app)
      .get(`/api/bookings/future/${parkingSpace._id}`)
      .set("Authorization", authHeader(hostToken));
    expect(futureResponse.status).toBe(200);
    expect(futureResponse.body).toHaveLength(1);
    expect(futureResponse.body[0]._id).toBe(createdId);

    const deleteResponse = await request(app)
      .delete(`/api/bookings/${createdId}`)
      .set("Authorization", authHeader(renterToken));
    expect(deleteResponse.status).toBe(204);

    const getDeletedResponse = await request(app)
      .get(`/api/bookings/${createdId}`)
      .set("Authorization", authHeader(renterToken));
    expect(getDeletedResponse.status).toBe(404);
  });
});

describe("Reports API operations", () => {
  it("supports create, list, get, update, delete", async () => {
    const { token } = await createAccessToken("Admin");
    const reporter = await User.create({
      email: uniqueEmail("reporter"),
      password: "password123",
      firstName: "Report",
      lastName: "Owner",
    });

    const createResponse = await request(app)
      .post("/api/reports")
      .set("Authorization", authHeader(token))
      .send({
        reporter: reporter._id,
        category: "safety",
        title: "Unsafe listing",
        description: "Broken gate and poor lighting",
        reportedUser: objectId(),
        reportedSpace: objectId(),
      });

    expect(createResponse.status).toBe(201);
    const createdId = createResponse.body._id;

    const listResponse = await request(app)
      .get("/api/reports")
      .set("Authorization", authHeader(token));
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.some((item) => item._id === createdId)).toBe(true);

    const getResponse = await request(app)
      .get(`/api/reports/${createdId}`)
      .set("Authorization", authHeader(token));
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.title).toBe("Unsafe listing");

    const updateResponse = await request(app)
      .put(`/api/reports/${createdId}`)
      .set("Authorization", authHeader(token))
      .send({ status: "resolved" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe("resolved");

    const deleteResponse = await request(app)
      .delete(`/api/reports/${createdId}`)
      .set("Authorization", authHeader(token));
    expect(deleteResponse.status).toBe(204);

    const getDeletedResponse = await request(app)
      .get(`/api/reports/${createdId}`)
      .set("Authorization", authHeader(token));
    expect(getDeletedResponse.status).toBe(404);
  });
});
