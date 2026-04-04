const mongoose = require("mongoose");
const User = require("./user");

const { Schema } = mongoose;

const hostSchema = new Schema(
  {
    payoutMethod: {
      type: String,
      enum: ["bank", "paypal", "stripe", "other"],
      default: "bank",
    },
    listingIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "ParkingSpace",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Host = User.discriminator("Host", hostSchema);

module.exports = Host;
