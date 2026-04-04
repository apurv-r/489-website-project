const express = require("express");

const usersRouter = require("./routes/users");
const parkingSpacesRouter = require("./routes/parkingSpaces");
const bookingsRouter = require("./routes/bookings");
const reportsRouter = require("./routes/reports");

const router = express.Router();

router.use("/users", usersRouter);
router.use("/parking-spaces", parkingSpacesRouter);
router.use("/bookings", bookingsRouter);
router.use("/reports", reportsRouter);

module.exports = router;
