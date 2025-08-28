const express = require("express");
const router = express.Router();
const {
  createOffer,
  getOffers,
  getOfferById,
  deleteOffer,
  updateOffer,
} = require("../controllers/offer.controller");
const { upload, cloudinaryUpload } = require("../middleware/upload.middleware");
const authMiddleware = require("../middleware/auth.middleware");

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  cloudinaryUpload,
  createOffer
);

router.get("/", getOffers);
router.get("/:id", getOfferById);

router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  cloudinaryUpload,
  updateOffer
);

router.delete("/:id", deleteOffer);

module.exports = router;