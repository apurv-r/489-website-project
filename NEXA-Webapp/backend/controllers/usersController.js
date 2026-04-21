const User = require("../models/user");
const Host = require("../models/host");
const Admin = require("../models/admin");
const Renter = require("../models/renter");

async function createAdmin(req, res, next) {
  try {
    const { email, password, firstName, lastName, permissions = [] } = req.body || {};

    const created = await Admin.create({
      email,
      password,
      firstName,
      lastName,
      permissions,
      roleType: "Admin",
      accountStatus: "active",
    });

    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
}

async function verifyHost(req, res, next) {
  try {
    const updatedHost = await Host.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedHost) {
      return res.status(404).json({ message: "Host not found" });
    }

    return res.json(updatedHost);
  } catch (error) {
    return next(error);
  }
}

async function updateUserAdminFields(req, res, next) {
  try {
    const allowedFields = ["accountStatus", "adminNotes"];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
}

async function getFavorites(req, res, next) {
  try {
    const renter = await Renter.findById(req.params.id).populate("favoritedListings");
    if (!renter) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(renter.favoritedListings || []);
  } catch (error) {
    return next(error);
  }
}

async function addFavorite(req, res, next) {
  try {
    const updated = await Renter.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { favoritedListings: req.params.listingId } },
      { returnDocument: "after" },
    );
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ favoritedListings: updated.favoritedListings });
  } catch (error) {
    return next(error);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const updated = await Renter.findByIdAndUpdate(
      req.params.id,
      { $pull: { favoritedListings: req.params.listingId } },
      { returnDocument: "after" },
    );
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ favoritedListings: updated.favoritedListings });
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  addFavorite,
  createAdmin,
  deleteUser,
  getFavorites,
  removeFavorite,
  updateUserAdminFields,
  verifyHost,
};
