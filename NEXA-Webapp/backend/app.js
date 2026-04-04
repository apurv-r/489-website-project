const express = require("express");

require("./models");
const apiRouter = require("./api");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "NEXA backend is running" });
});

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
