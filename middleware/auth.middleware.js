const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError(401, "Authentication required"));
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and exclude password
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    if (user.isBlocked) {
      return next(new ApiError(403, "Account blocked"));
    }

    if (user.isDeleted) {
      return next(new ApiError(403, "Account deleted"));
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token"));
    }

    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired"));
    }

    return next(new ApiError(500, error.message));
  }
};

module.exports = authMiddleware;