const mongoose = require("mongoose");

const pendingRegistrationSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
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

pendingRegistrationSchema.index(
  { otpExpiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
  "pending_registrations",
  pendingRegistrationSchema
);