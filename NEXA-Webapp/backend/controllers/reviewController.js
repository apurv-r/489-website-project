const Review = require("../models/review");
const Booking = require("../models/booking");
const ParkingSpace = require("../models/parkingSpace");

async function recalculateRating(parkingSpaceId) {
  const reviews = await Review.find({ parkingSpace: parkingSpaceId });
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  await ParkingSpace.findByIdAndUpdate(parkingSpaceId, {
    ratingAverage: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
}

async function createReview(req, res) {
  try {
    const { bookingId, rating, comment } = req.body;
    const renterId = req.user._id;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: "bookingId and rating are required." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }
    if (booking.renter.toString() !== renterId.toString()) {
      return res.status(403).json({ message: "You can only review your own bookings." });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "You can only review completed bookings." });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this booking." });
    }

    const review = await Review.create({
      rating,
      comment: comment || "",
      renter: renterId,
      parkingSpace: booking.parkingSpace,
      booking: bookingId,
    });

    await recalculateRating(booking.parkingSpace);

    const populated = await review.populate("renter", "firstName lastName");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create review." });
  }
}

async function getReviewsForListing(req, res) {
  try {
    const { listingId } = req.params;
    const reviews = await Review.find({ parkingSpace: listingId })
      .populate("renter", "firstName lastName profilePictureUrl")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reviews." });
  }
}

async function getReviewForBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const review = await Review.findOne({ booking: bookingId });
    res.json(review || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch review." });
  }
}

module.exports = { createReview, getReviewsForListing, getReviewForBooking };
