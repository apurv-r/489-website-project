const mongoose = require("mongoose");
const User = require("./user");

const { Schema } = mongoose;

const renterSchema = new Schema(
  {
    savedListings: [
      {
        type: Schema.Types.ObjectId,
        ref: "ParkingSpace",
      },
    ],
    favoriteHosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Host",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Renter = User.discriminator("Renter", renterSchema);

module.exports = Renter;
