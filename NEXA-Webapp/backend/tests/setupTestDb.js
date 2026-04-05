const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { clearSessions } = require("../middleware/sessionAuth");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  process.env.MONGODB_URI = uri;
  process.env.USE_LOCAL_MONGODB = "false";

  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  const cleanupPromises = Object.values(collections).map((collection) =>
    collection.deleteMany({}),
  );
  await Promise.all(cleanupPromises);
  clearSessions();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
