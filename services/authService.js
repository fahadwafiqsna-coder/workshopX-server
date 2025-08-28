const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const generateAccessToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const findUserById = async (userId) => {
  return await User.findById(userId).select("-password");
};

module.exports = {
  generateAccessToken,
  verifyToken,
  findUserById,
};