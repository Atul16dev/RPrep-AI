const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    otpExpiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

passwordResetSchema.index(
  { otpExpiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
  "password_resets",
  passwordResetSchema
);