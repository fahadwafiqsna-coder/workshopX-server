const express = require("express");
const router = express.Router();

const {
  createService,
  getServices,
  getServiceById,
  updateServices,
  deleteService,
} = require("../controllers/service.controller");
const { upload, cloudinaryUpload } = require("../middleware/upload.middleware");
const authMiddleware = require("../middleware/auth.middleware");

router.post(
  "/create-service",
  authMiddleware,
  upload.single("image"),
  cloudinaryUpload,
  createService
);

router.get("/", getServices);
router.get("/:id", getServiceById);
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  cloudinaryUpload,
  updateServices
);
router.delete("/:id", authMiddleware, deleteService);

module.exports = router;
