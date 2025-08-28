const mongoose = require("mongoose");
const { _enum } = require("zod/v4/core");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please use a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ["Business", "Private"],
      required: true,
      trim: true,
    },
    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },
    context: {
      type: String,
      required: true,
      trim: true,
    },
    adminReply: {
      type: [String],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
