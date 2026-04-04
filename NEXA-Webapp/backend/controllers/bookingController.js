const Booking = require("../models/booking");

async function getFutureBookingsFor(req, res, next) {
  try {
    const { parkingSpaceId } = req.params;
    const now = new Date();

    const bookings = await Booking.find({
      parkingSpace: parkingSpaceId,
      startDate: { $gte: now },
    }).sort({ startDate: 1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

async function createBooking(req, res, next) {
  try {
    const created = await Booking.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFutureBookingsFor,
  createBooking,
};
