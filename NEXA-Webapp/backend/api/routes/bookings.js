const express = require("express");
const Booking = require("../../models/booking");
const createCrudController = require("../../controllers/crudFactory");
const bookingController = require("../../controllers/bookingController");
const requireRole = require("../../middleware/requireRole");

const router = express.Router();
const controller = createCrudController(Booking);

router.get("/me", bookingController.getMyBookings);
router.get("/", requireRole("Admin"), controller.list);
router.get(
  "/future/:parkingSpaceId",
  requireRole("Host", "Admin"),
  bookingController.getFutureBookingsFor,
);
router.get("/:id", bookingController.getBookingIfOwner);
router.post("/", bookingController.createBooking);
router.put("/:id", bookingController.updateBookingIfOwner);
router.delete("/:id", bookingController.deleteBookingIfOwner);

module.exports = router;
