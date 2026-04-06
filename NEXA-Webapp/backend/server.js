const path = require("path");
const dns = require("dns");
dns.setServers(["1.1.1.1"]); // Use Cloudflare DNS to avoid potential issues with connecting to MongoDB Atlas
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });
const connectDB = require("./config/db");
const app = require("./app");
const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
