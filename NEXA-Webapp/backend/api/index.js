const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const parkingSpaceController = require("../controllers/parkingSpaceController");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const parkingSpacesRouter = require("./routes/parkingSpaces");
const bookingsRouter = require("./routes/bookings");
const reportsRouter = require("./routes/reports");
const testRouter = require("./routes/test");

const privateRouter = express.Router();
const publicRouter = express.Router();
const router = express.Router();

// routs dont require auth
publicRouter.get("/parking-spaces", parkingSpaceController.listPublic);
publicRouter.get("/parking-spaces/:id", parkingSpaceController.getPublic);
publicRouter.use("/test", testRouter);

// routs require auth
privateRouter.use("/auth", authRouter);
privateRouter.use(requireAuth);
privateRouter.use("/users", usersRouter);
privateRouter.use("/parking-spaces", parkingSpacesRouter);
privateRouter.use("/bookings", bookingsRouter);
privateRouter.use("/reports", reportsRouter);

router.use(publicRouter);
router.use(privateRouter);

module.exports = router;