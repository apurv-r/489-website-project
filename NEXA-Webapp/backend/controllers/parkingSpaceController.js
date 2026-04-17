const ParkingSpace = require("../models/parkingSpace");

async function listPublic(req, res, next) {
  try {
    // Only published spaces are visible to unauthenticated/public users.
    const spaces = await ParkingSpace.find({ isPublished: true }).populate(
      "host",
      "firstName lastName",
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
      "firstName lastName",
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
    const isAdmin = req.user?.roleType === "Admin";
    const filter = isAdmin
      ? req.query.host
        ? { host: req.query.host }
        : {}
      : { host: req.user._id };

    const spaces = await ParkingSpace.find(filter)
      .populate("host", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(spaces);
  } catch (error) {
    next(error);
  }
}

async function getListing(req, res, next) {
  try {
    const space = await ParkingSpace.findById(req.params.id).populate(
      "host",
      "firstName lastName",
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
  listPublic,
  getPublic,
  listMine,
  getListing,
};
