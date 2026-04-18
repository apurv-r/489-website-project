const ParkingSpace = require("../models/parkingSpace");
const Host = require("../models/host");

async function createListing(req, res, next) {
  try {
    const created = await ParkingSpace.create(req.body);

    let updatedHost = null;
    const hostId = created?.host;
    if (hostId) {
      updatedHost = await Host.findByIdAndUpdate(
        hostId,
        { $addToSet: { listingIds: created._id } },
        { returnDocument: "after", runValidators: true },
      );
    }

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function listPublic(req, res, next) {
  try {
    const isAdminRequest = req.user?.roleType === "Admin";
    if (isAdminRequest) {
      // Admins can see all spaces, including unpublished ones.
      const spaces = await ParkingSpace.find({});
      return res.json(spaces);
    }

    // Only published and verified spaces are visible to unauthenticated/public users.
    const spaces = await ParkingSpace.find({ isPublished: true, isVerified: true }).populate(
      "host",
      "firstName lastName isVerified",
    );
    res.json(spaces);
  } catch (error) {
    next(error);
  }
}

async function getPublic(req, res, next) {
  try {
    const space = await ParkingSpace.findById(req.params.id).populate(
      "host",
      "firstName lastName isVerified",
    );
    // 404 Not Found: hide unpublished or missing spaces from the public endpoint.
    if (!space || !space.isPublished) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(space);
  } catch (error) {
    next(error);
  }
}

async function listMine(req, res, next) {
  try {
    const filter = req.query.host ? { host: req.query.host } : {};

    const spaces = await ParkingSpace.find(filter)
      .populate("host", "firstName lastName isVerified")
      .sort({ createdAt: -1 });

    res.json(spaces);
  } catch (error) {
    next(error);
  }
}

async function getListing(req, res, next) {
  try {
    const isAdminRequest = req.user?.roleType === "Admin";
    if (isAdminRequest) {
      const space = await ParkingSpace.findById(req.params.id);
      if (!space) {
        return res.status(404).json({ message: "Failed to get listing: Not found" });
      }
      return res.json(space);
    }

    const space = await ParkingSpace.findById(req.params.id).populate(
      "host",
      "firstName lastName isVerified",
    );
    if (!space) {
      return res.status(404).json({ message: "Failed to get listing: Not found" });
    }
    res.json(space);
  } catch (error) {
    next(error);
  }
}
module.exports = {
  createListing,
  listPublic,
  getPublic,
  listMine,
  getListing,
};
