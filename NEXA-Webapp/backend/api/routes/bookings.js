const express = require("express");
const Booking = require("../../models/booking");
const createCrudController = require("../../controllers/crudFactory");
const bookingController = require("../../controllers/bookingController");

const router = express.Router();
const controller = createCrudController(Booking);

router.get("/", controller.list);
router.get("/future/:parkingSpaceId", bookingController.getFutureBookingsFor);
router.get("/:id", controller.getById);
router.post("/", bookingController.createBooking);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
