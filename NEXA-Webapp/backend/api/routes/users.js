const express = require("express");
const User = require("../../models/user");
const Host = require("../../models/host");
const Admin = require("../../models/admin");
const createCrudController = require("../../controllers/crudFactory");
const requireRole = require("../../middleware/requireRole");

const router = express.Router();
const controller = createCrudController(User);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.post("/admins", requireRole("Admin"), async (req, res, next) => {
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
});
router.put("/message/:senderId/:recipientId", controller.sendMessage);
router.put("/hosts/:id/verify", requireRole("Admin"), async (req, res, next) => {
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
});
router.patch("/:id", requireRole("Admin"), async (req, res, next) => {
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
});
router.put("/:id", controller.update);
router.delete("/:id", requireRole("Admin"), async (req, res, next) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
