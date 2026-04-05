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

module.exports = {
  listPublic,
  getPublic,
};
