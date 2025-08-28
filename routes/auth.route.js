const express = require("express");
const router = express.Router();
const { signup, login, verifyEmail, resetPassword, changePassword } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/reset-password", resetPassword);
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;