const express = require("express");
const reviewController = require("../../controllers/reviewController");

const router = express.Router();

// POST /api/reviews — submit a review (renter, booking must be completed)
router.post("/", reviewController.createReview);

// GET /api/reviews/listing/:listingId — get all reviews for a parking space
router.get("/listing/:listingId", reviewController.getReviewsForListing);

// GET /api/reviews/booking/:bookingId — check if a booking already has a review
router.get("/booking/:bookingId", reviewController.getReviewForBooking);

module.exports = router;
