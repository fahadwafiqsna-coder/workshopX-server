const express = require("express");
const router = express.Router();
const {
  createContact,
  getContacts,
  markAsRead,
  deleteContact,
  adminReplyContactEmail,
} = require("../controllers/contact.controller");
const authMiddleware = require("../middleware/auth.middleware");


router.post("/", createContact);


router.get("/", authMiddleware, getContacts);
router.patch("/:id/read", authMiddleware, markAsRead);
router.post("/admin-reply/:id", authMiddleware, adminReplyContactEmail);
router.delete("/:id", authMiddleware, deleteContact);

module.exports = router;