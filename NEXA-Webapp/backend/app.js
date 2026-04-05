const express = require("express");
const passport = require("passport");

require("./models");
const { configurePassport } = require("./config/passport");
const { loadSessionUser } = require("./middleware/sessionAuth");
const apiRouter = require("./api");

configurePassport();

const app = express();

app.use(express.json());
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
