const mongoose = require("mongoose");

const { Schema } = mongoose;

const parkingSpaceSchema = new Schema(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: "Host",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
    },
    description: {
      type: String,
      trim: true,
    },
    parkingType: {
      type: String,
      enum: ["garage", "driveway", "open lot", "covered"],
      required: true,
    },
    maxVehicleSize: {
      type: String,
      enum: ["compact", "standard", "suv/midsize", "truck/large"],
      default: "standard",
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    imageUrls: [
      {
        type: String,
        trim: true,
      },
    ],
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumBookingDays: {
      type: Number,
      default: 1,
      min: 1,
    },
    availableFrom: {
      type: Date,
    },
    availableUntil: {
      type: Date,
    },
    availableDays: [
      {
        type: String,
        enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    ratingAverage: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

parkingSpaceSchema.path("imageUrls").validate(function (value) {
  if (!this.isPublished) {
    return true;
  }

  return Array.isArray(value) && value.length > 0;
}, "Published parking spaces must include at least one image URL.");

const ParkingSpace = mongoose.model("ParkingSpace", parkingSpaceSchema);

module.exports = ParkingSpace;
