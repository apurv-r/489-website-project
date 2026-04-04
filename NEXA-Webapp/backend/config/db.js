const mongoose = require("mongoose");

function isTruthy(value) {
  return ["true", "1", "yes", "on"].includes(String(value || "").toLowerCase());
}

async function connectDB() {
  const useLocalMongo = isTruthy(process.env.USE_LOCAL_MONGODB);
  const localUri =
    process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017/nexa";
  const primaryUri = process.env.MONGODB_URI;
  const uri = useLocalMongo ? localUri : primaryUri;

  if (!uri) {
    console.warn("MongoDB URI is not set. Skipping database connection.");
    return null;
  }

  try {
    await mongoose.connect(uri);
    console.log(
      `Connected to MongoDB (${useLocalMongo ? "local" : "primary"} URI)`,
    );
    return mongoose.connection;
  } catch (error) {
    console.warn("MongoDB connection failed.");
    console.warn(error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
