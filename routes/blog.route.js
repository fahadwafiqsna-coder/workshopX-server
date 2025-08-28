const express = require("express");
const router = express.Router();
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blog.controller");
const { upload, cloudinaryUpload } = require("../middleware/upload.middleware");
const authMiddleware = require("../middleware/auth.middleware");

router.post(
  "/create-blogs",
  authMiddleware,
  upload.single("image"),
  cloudinaryUpload,
  createBlog
);
router.get("/", getBlogs);
router.get("/:id", getBlogById);

router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  cloudinaryUpload,
  updateBlog
);

router.delete("/:id", authMiddleware, deleteBlog);


module.exports = router;