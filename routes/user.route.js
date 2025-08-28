const express = require("express");
const router = express.Router();
const { deleteUser, toggleBlockUser, getAllUsers } = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, getAllUsers);
router.delete("/:id", authMiddleware, deleteUser);
router.patch("/:id/block", authMiddleware, toggleBlockUser);

module.exports = router;