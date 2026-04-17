const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const parkingSpaceController = require("../controllers/parkingSpaceController");
const bookingController = require("../controllers/bookingController");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const parkingSpacesRouter = require("./routes/parkingSpaces");
const bookingsRouter = require("./routes/bookings");
const reportsRouter = require("./routes/reports");
const uploadsRouter = require("./routes/uploads");
const testRouter = require("./routes/test");

const privateRouter = express.Router();
const publicRouter = express.Router();
const router = express.Router();

// routes dont require auth
publicRouter.get("/parking-spaces", parkingSpaceController.listPublic);
publicRouter.get("/parking-spaces/:id", (req, res, next) => {
  if (req.params.id === "me") {
    return next(); // Avoid conflict with the protected "me" route in the private (host/admin) router.
  }

  return parkingSpaceController.getPublic(req, res, next);
});
publicRouter.get("/bookings/future/:parkingSpaceId", bookingController.getCurrentAndFutureBookingsFor);
publicRouter.use("/test", testRouter);

// routes require auth
privateRouter.use("/auth", authRouter);
privateRouter.use(requireAuth); // all routes below this line require authentication
privateRouter.use("/users", usersRouter);
privateRouter.use("/uploads", uploadsRouter);
privateRouter.use("/parking-spaces", parkingSpacesRouter);
privateRouter.use("/bookings", bookingsRouter);
privateRouter.use("/reports", reportsRouter);

router.use(publicRouter);
router.use(privateRouter);

module.exports = router;
