const PlatformSettings = require("../models/platformSettings");

async function getOrCreateSettings() {
  let settings = await PlatformSettings.findOne({ key: "platform" });

  if (!settings) {
    settings = await PlatformSettings.create({ key: "platform" });
  }

  return settings;
}

function serializeSettings(settings) {
  return {
    serviceFee: settings.serviceFee,
    minListingPrice: settings.minListingPrice,
    maxPhotosPerListing: settings.maxPhotosPerListing,
    updatedAt: settings.updatedAt,
  };
}

async function getPlatformSettings(req, res, next) {
  try {
    const settings = await getOrCreateSettings();
    res.json(serializeSettings(settings));
  } catch (error) {
    next(error);
  }
}

async function updatePlatformSettings(req, res, next) {
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

    res.json(serializeSettings(settings));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPlatformSettings,
  updatePlatformSettings,
};
