const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const requireRole = require("../../middleware/requireRole");

const router = express.Router();

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const extension = ALLOWED_IMAGE_TYPES[file.mimetype] || "bin";
    cb(null, `${crypto.randomUUID()}.${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 12,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES[file.mimetype]) {
      return cb(new Error("Only JPG, PNG, WEBP, and GIF images are allowed."));
    }

    cb(null, true);
  },
});

router.post(
  "/images",
  requireRole("Host", "Admin"),
  upload.array("images", 12),
  (req, res) => {
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({
        message: "Upload at least one image.",
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const files = req.files.map((file) => ({
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: `${baseUrl}/uploads/${file.filename}`,
    }));

    return res.status(201).json({ files });
  },
);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "Each image must be 10 MB or smaller." });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json({ message: "You can upload up to 12 images at a time." });
    }

    return res.status(400).json({ message: error.message });
  }

  if (error?.message) {
    return res.status(400).json({ message: error.message });
  }

  return next(error);
});

module.exports = router;
