const mongoose = require("mongoose");
const User = require("./user");

const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Admin = User.discriminator("Admin", adminSchema);

module.exports = Admin;
