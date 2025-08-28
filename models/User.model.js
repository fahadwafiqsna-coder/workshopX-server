const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verificationToken: String,
    verificationTokenExpiry: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);