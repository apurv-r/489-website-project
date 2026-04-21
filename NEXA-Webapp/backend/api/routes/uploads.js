const express = require("express");
const requireRole = require("../../middleware/requireRole");
const {
  handleUploadError,
  uploadImages,
  uploadImagesMiddleware,
} = require("../../controllers/uploadsController");

const router = express.Router();

router.post("/images", requireRole("Host", "Admin"), uploadImagesMiddleware, uploadImages);
router.use(handleUploadError);

module.exports = router;
