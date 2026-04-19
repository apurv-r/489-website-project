const express = require("express");
const PlatformSettings = require("../../models/platformSettings");
const requireRole = require("../../middleware/requireRole");

const router = express.Router();

async function getOrCreateSettings() {
  let settings = await PlatformSettings.findOne({ key: "platform" });

  if (!settings) {
    settings = await PlatformSettings.create({ key: "platform" });
  }

  return settings;
}

router.get("/", async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();

    res.json({
      serviceFee: settings.serviceFee,
      minListingPrice: settings.minListingPrice,
      maxPhotosPerListing: settings.maxPhotosPerListing,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/", requireRole("Admin"), async (req, res, next) => {
  try {
    const { serviceFee, minListingPrice, maxPhotosPerListing } = req.body || {};

    const nextValues = {
      ...(serviceFee !== undefined ? { serviceFee: Number(serviceFee) } : {}),
      ...(minListingPrice !== undefined ? { minListingPrice: Number(minListingPrice) } : {}),
      ...(maxPhotosPerListing !== undefined
        ? { maxPhotosPerListing: Number(maxPhotosPerListing) }
        : {}),
    };

    if (Object.keys(nextValues).length === 0) {
      return res.status(400).json({ message: "No settings provided to update." });
    }

    if (nextValues.serviceFee !== undefined && Number.isNaN(nextValues.serviceFee)) {
      return res.status(400).json({ message: "Service fee must be a valid number." });
    }

    if (nextValues.minListingPrice !== undefined && Number.isNaN(nextValues.minListingPrice)) {
      return res.status(400).json({ message: "Minimum listing price must be a valid number." });
    }

    if (
      nextValues.maxPhotosPerListing !== undefined &&
      Number.isNaN(nextValues.maxPhotosPerListing)
    ) {
      return res.status(400).json({
        message: "Max photos per listing must be a valid number.",
      });
    }

    const settings = await getOrCreateSettings();

    Object.assign(settings, nextValues);
    await settings.save();

    res.json({
      serviceFee: settings.serviceFee,
      minListingPrice: settings.minListingPrice,
      maxPhotosPerListing: settings.maxPhotosPerListing,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
