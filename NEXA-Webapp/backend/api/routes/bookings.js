const express = require("express");
const Booking = require("../../models/booking");
const createCrudController = require("../../controllers/crudFactory");
const bookingController = require("../../controllers/bookingController");
const requireRole = require("../../middleware/requireRole");

const router = express.Router();
const controller = createCrudController(Booking);

router.get("/me", bookingController.getMyBookings);
router.get("/", requireRole("Admin"), bookingController.listBookingsForAdmin);
router.get("/future/:parkingSpaceId", bookingController.getCurrentAndFutureBookingsFor);
router.get("/:id", bookingController.getBookingIfOwner);
router.post("/", bookingController.createBooking);
// not really sure why i did it this way lol (below)
router.put("/request/:parkingSpaceId/:renterId", bookingController.requestParkingSpace);
router.put("/:id", bookingController.updateBookingIfOwner);
router.delete("/:id", bookingController.deleteBookingIfOwner);

module.exports = router;
