const mongoose = require("mongoose");
const User = require("./user");

const { Schema } = mongoose;

const renterSchema = new Schema(
  {
    favoritedListings: [
      {
        type: Schema.Types.ObjectId,
        ref: "ParkingSpace",
      },
    ]
  },
  {
    timestamps: true,
  },
);

const Renter = User.discriminator("Renter", renterSchema);

module.exports = Renter;

