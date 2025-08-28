
const ApiError = require("../utils/ApiError");

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  console.error("❌ Error:", err.message || "Unknown error", {
    stack: err.stack,
    path: req.path,
  });

  // If response is already sent, do not send again
  if (res.headersSent) {
    return next(err);
  }

  // Default status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  // Send structured JSON response
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    data: null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;