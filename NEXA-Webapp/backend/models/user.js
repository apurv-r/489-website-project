const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    lastLoginAt: {
      type: Date,
    },
    profilePictureUrl: {
      type: String,
      trim: true,
    },
    messages: {
      type: Map,
      of: new Schema({
        role: { type: String },
        messageHistory: [{ type: String }],
      }),
      default: {},
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
    discriminatorKey: "roleType",
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.pre("findOneAndUpdate", async function hashUpdatedPassword() {
  const update = this.getUpdate() || {};
  const password = update.password || update.$set?.password;

  if (!password) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (update.password) {
    update.password = hashedPassword;
  }

  if (update.$set?.password) {
    update.$set.password = hashedPassword;
  }

  this.setUpdate(update);
});

userSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;