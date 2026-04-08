const mongoose = require("mongoose");

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    renter: {
      type: Schema.Types.ObjectId,
      ref: "Renter",
      required: true,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "Host",
      required: true,
    },
    parkingSpace: {
      type: Schema.Types.ObjectId,
      ref: "ParkingSpace",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "declined",
        "active",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Perf optimization: Ensures ascending order of bookings by parking space and date for efficient availability checks
bookingSchema.index({ parkingSpace: 1, startDate: 1, endDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
