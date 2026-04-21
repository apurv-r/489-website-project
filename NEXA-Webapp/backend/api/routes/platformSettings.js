const express = require("express");
const requireRole = require("../../middleware/requireRole");
const {
  getPlatformSettings,
  updatePlatformSettings,
} = require("../../controllers/platformSettingsController");

const router = express.Router();

router.get("/", getPlatformSettings);
router.patch("/", requireRole("Admin"), updatePlatformSettings);

module.exports = router;
