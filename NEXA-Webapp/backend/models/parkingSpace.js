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
      enum: [
        "garage",
        "driveway",
        "open lot",
        "underground",
        "covered",
        "street",
      ],
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
    accessInstructions: {
      type: String,
      trim: true,
    },
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

const ParkingSpace = mongoose.model("ParkingSpace", parkingSpaceSchema);

module.exports = ParkingSpace;
