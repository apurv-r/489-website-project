const express = require("express");
const passport = require("passport");
const fs = require("fs");
const path = require("path");

require("./models");
const { configurePassport } = require("./config/passport");
const { loadSessionUser } = require("./middleware/sessionAuth");
const apiRouter = require("./api");
const cors = require("cors");

configurePassport();

const app = express();
const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(
  cors({
    origin: "http://localhost:3000", // this is where the react app runs
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));
app.use(passport.initialize());
app.use(loadSessionUser);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "NEXA backend is running" });
});

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  console.error(err);
  // 500 Internal Server Error: unhandled exception on the server.
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
