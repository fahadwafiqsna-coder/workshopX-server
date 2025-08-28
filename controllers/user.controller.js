const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");


const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isDeleted: true });
    if (!user) return next(new ApiError(404, "User not found"));
    res.json({ message: "User soft deleted" });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const toggleBlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return next(new ApiError(404, "User not found"));
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"}` });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = { getAllUsers, deleteUser, toggleBlockUser };