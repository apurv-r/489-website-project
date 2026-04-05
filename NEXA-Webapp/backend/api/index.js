const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const parkingSpaceController = require("../controllers/parkingSpaceController");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const parkingSpacesRouter = require("./routes/parkingSpaces");
const bookingsRouter = require("./routes/bookings");
const reportsRouter = require("./routes/reports");

const router = express.Router();

router.use("/auth", authRouter);

const publicRouter = express.Router();
publicRouter.get("/parking-spaces", parkingSpaceController.listPublic);
publicRouter.get("/parking-spaces/:id", parkingSpaceController.getPublic);
router.use(publicRouter);

router.use(requireAuth);

router.use("/users", usersRouter);
router.use("/parking-spaces", parkingSpacesRouter);
router.use("/bookings", bookingsRouter);
router.use("/reports", reportsRouter);

module.exports = router;
