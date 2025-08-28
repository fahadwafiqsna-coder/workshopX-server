const multer = require("multer");
const { uploadToCloudinary } = require("../services/cloudinaryService");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const cloudinaryUpload = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const url = await uploadToCloudinary(req.file.buffer);
    req.body.image = url;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, cloudinaryUpload };