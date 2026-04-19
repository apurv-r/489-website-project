const mongoose = require("mongoose");

const { Schema } = mongoose;

const platformSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "platform",
    },
    serviceFee: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    minListingPrice: {
      type: Number,
      default: 5,
      min: 0,
    },
    maxPhotosPerListing: {
      type: Number,
      default: 12,
      min: 1,
      max: 50,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);
