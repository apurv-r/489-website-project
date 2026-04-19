const Booking = require("../models/booking");
const ParkingSpace = require("../models/parkingSpace");

async function listBookingsForAdmin(req, res, next) {
  try {
    const query = req.query || {};
    const bookings = await Booking.find(query)
      .populate("parkingSpace", "title")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

async function getCurrentAndFutureBookingsFor(req, res, next) {
  try {
    const { parkingSpaceId } = req.params;
    const now = new Date().setHours(0, 0, 0, 0); // Normalize to start of day for consistent comparisons

    const space = await ParkingSpace.findById(parkingSpaceId);
    // 404 Not Found
    if (!space) {
      return res.status(404).json({ message: "Not found" });
    }

    const bookings = await Booking.find({
      parkingSpace: parkingSpaceId,
      endDate: { $gte: now },
    })
      .select("startDate endDate status")
      .sort({ startDate: 1 }); // Sort by startDate ascending for easier frontend processing

    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

async function createBooking(req, res, next) {
  try {
    const created = await Booking.create(req.body);
    // 201 Created: booking was created successfully.
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function getMyBookings(req, res, next) {
  try {
    // A user can see bookings where they are either the renter or the host.
    const bookings = await Booking.find({
      $or: [{ renter: req.user._id }, { host: req.user._id }],
    })
      .populate("renter", "firstName lastName email")
      .populate("parkingSpace", "title imageUrls location parkingType dailyRate description");
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

async function getBookingIfOwner(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    // 404 Not Found: no booking exists with this id.
    if (!booking) {
      return res.status(404).json({ message: "Not found" });
    }

    // 403 Forbidden: user exists but is not the owner/participant/admin.
    if (
      booking.renter.toString() !== req.user._id.toString() &&
      booking.host.toString() !== req.user._id.toString() &&
      req.user.roleType !== "Admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function requestParkingSpace(req, res, next) {
  try {
    const { parkingSpaceId, renterId } = req.params;
    const { startDate, endDate, totalAmount } = req.body;

    if (!startDate || !endDate || !totalAmount) {
      return res.status(400).json({ message: "startDate, endDate, and totalAmount are required" });
    }

    const space = await ParkingSpace.findById(parkingSpaceId);
    if (!space || !space.isPublished) {
      return res.status(404).json({ message: "Parking space not found or unavailable" });
    }

    const booking = await Booking.create({
      parkingSpace: parkingSpaceId,
      renter: renterId,
      host: space.host,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalAmount: Number(totalAmount),
      status: "pending",
      requestedAt: new Date(),
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

async function updateBookingIfOwner(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    // 404 Not Found: no booking exists with this id.
    if (!booking) {
      return res.status(404).json({ message: "Not found" });
    }

    // 403 Forbidden: user is not allowed to modify this booking.
    if (
      booking.renter.toString() !== req.user._id.toString() &&
      booking.host.toString() !== req.user._id.toString() &&
      req.user.roleType !== "Admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteBookingIfOwner(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    // 404 Not Found: no booking exists with this id.
    if (!booking) {
      return res.status(404).json({ message: "Not found" });
    }

    // 403 Forbidden: user is not allowed to delete this booking.
    if (
      booking.renter.toString() !== req.user._id.toString() &&
      booking.host.toString() !== req.user._id.toString() &&
      req.user.roleType !== "Admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Booking.findByIdAndDelete(req.params.id);
    // 204 No Content: deletion succeeded and body is intentionally empty.
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listBookingsForAdmin,
  getCurrentAndFutureBookingsFor,
  createBooking,
  getMyBookings,
  getBookingIfOwner,
  requestParkingSpace,
  updateBookingIfOwner,
  deleteBookingIfOwner,
};
