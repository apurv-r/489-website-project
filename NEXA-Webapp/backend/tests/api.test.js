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
    maxVehicleSize: "standard",
    dailyRate: 15,
    minimumBookingDays: 1,
    availableDays: ["mon", "tue", "wed"],
    isPublished: true,
  });
}

describe("API health", () => {
  it("GET /api/health returns status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});

describe("Users API operations", () => {
  it("supports create, list, get, update, delete", async () => {
    const createResponse = await request(app)
      .post("/api/users")
      .send({
        email: uniqueEmail("base"),
        password: "password123",
        firstName: "Base",
        lastName: "User",
      });

    expect(createResponse.status).toBe(201);
    const createdId = createResponse.body._id;

    const listResponse = await request(app).get("/api/users");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);

    const getResponse = await request(app).get(`/api/users/${createdId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.firstName).toBe("Base");

    const updateResponse = await request(app)
      .put(`/api/users/${createdId}`)
      .send({ firstName: "Updated" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.firstName).toBe("Updated");

    const deleteResponse = await request(app).delete(`/api/users/${createdId}`);
    expect(deleteResponse.status).toBe(204);

    const getDeletedResponse = await request(app).get(
      `/api/users/${createdId}`,
    );
    expect(getDeletedResponse.status).toBe(404);
  });
});

describe("Parking Spaces API operations", () => {
  it("supports create, list, get, update, delete", async () => {
    const host = await createHostUser();

    const createResponse = await request(app)
      .post("/api/parking-spaces")
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
      });

    expect(createResponse.status).toBe(201);
    const createdId = createResponse.body._id;

    const listResponse = await request(app).get("/api/parking-spaces");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);

    const getResponse = await request(app).get(
      `/api/parking-spaces/${createdId}`,
    );
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.title).toBe("Downtown Spot");

    const updateResponse = await request(app)
      .put(`/api/parking-spaces/${createdId}`)
      .send({ title: "Updated Spot" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.title).toBe("Updated Spot");

    const deleteResponse = await request(app).delete(
      `/api/parking-spaces/${createdId}`,
    );
    expect(deleteResponse.status).toBe(204);

    const getDeletedResponse = await request(app).get(
      `/api/parking-spaces/${createdId}`,
    );
    expect(getDeletedResponse.status).toBe(404);
  });
});

describe("Bookings API operations", () => {
  it("supports create, list, get, update, delete, and future filter", async () => {
    const host = await createHostUser();
    const renter = await createRenterUser();
    const parkingSpace = await createParkingSpaceDoc(host._id);

    const futureStart = new Date();
    futureStart.setDate(futureStart.getDate() + 5);
    const futureEnd = new Date();
    futureEnd.setDate(futureEnd.getDate() + 7);

    const createResponse = await request(app).post("/api/bookings").send({
      renter: renter._id,
      host: host._id,
      parkingSpace: parkingSpace._id,
      startDate: futureStart,
      endDate: futureEnd,
      totalAmount: 45,
      status: "pending",
    });

    expect(createResponse.status).toBe(201);
    const createdId = createResponse.body._id;

    const listResponse = await request(app).get("/api/bookings");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);

    const getResponse = await request(app).get(`/api/bookings/${createdId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.totalAmount).toBe(45);

    const updateResponse = await request(app)
      .put(`/api/bookings/${createdId}`)
      .send({ status: "approved" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe("approved");

    const pastStart = new Date();
    pastStart.setDate(pastStart.getDate() - 5);
    const pastEnd = new Date();
    pastEnd.setDate(pastEnd.getDate() - 3);

    await Booking.create({
      renter: renter._id,
      host: host._id,
      parkingSpace: parkingSpace._id,
      startDate: pastStart,
      endDate: pastEnd,
      totalAmount: 10,
      status: "completed",
    });

    const futureResponse = await request(app).get(
      `/api/bookings/future/${parkingSpace._id}`,
    );
    expect(futureResponse.status).toBe(200);
    expect(futureResponse.body).toHaveLength(1);
    expect(futureResponse.body[0]._id).toBe(createdId);

    const deleteResponse = await request(app).delete(
      `/api/bookings/${createdId}`,
    );
    expect(deleteResponse.status).toBe(204);

    const getDeletedResponse = await request(app).get(
      `/api/bookings/${createdId}`,
    );
    expect(getDeletedResponse.status).toBe(404);
  });
});

describe("Reports API operations", () => {
  it("supports create, list, get, update, delete", async () => {
    const reporter = await User.create({
      email: uniqueEmail("reporter"),
      password: "password123",
      firstName: "Report",
      lastName: "Owner",
    });

    const createResponse = await request(app).post("/api/reports").send({
      reporter: reporter._id,
      category: "safety",
      title: "Unsafe listing",
      description: "Broken gate and poor lighting",
      reportedUser: objectId(),
      reportedSpace: objectId(),
    });

    expect(createResponse.status).toBe(201);
    const createdId = createResponse.body._id;

    const listResponse = await request(app).get("/api/reports");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);

    const getResponse = await request(app).get(`/api/reports/${createdId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.title).toBe("Unsafe listing");

    const updateResponse = await request(app)
      .put(`/api/reports/${createdId}`)
      .send({ status: "resolved" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe("resolved");

    const deleteResponse = await request(app).delete(
      `/api/reports/${createdId}`,
    );
    expect(deleteResponse.status).toBe(204);

    const getDeletedResponse = await request(app).get(
      `/api/reports/${createdId}`,
    );
    expect(getDeletedResponse.status).toBe(404);
  });
});
