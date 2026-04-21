const express = require("express");
const User = require("../../models/user");
const createCrudController = require("../../controllers/crudFactory");
const {
  addFavorite,
  createAdmin,
  deleteUser,
  getFavorites,
  removeFavorite,
  updateUserAdminFields,
  verifyHost,
} = require("../../controllers/usersController");
const requireRole = require("../../middleware/requireRole");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();
const controller = createCrudController(User);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.post("/admins", requireRole("Admin"), createAdmin);
router.put("/message/:senderId/:recipientId", controller.sendMessage);
router.put("/hosts/:id/verify", requireRole("Admin"), verifyHost);
router.patch("/:id", requireRole("Admin"), updateUserAdminFields);
router.get("/:id/favorites", requireAuth, getFavorites);
router.put("/:id/favorites/:listingId", requireAuth, addFavorite);
router.delete("/:id/favorites/:listingId", requireAuth, removeFavorite);
router.put("/:id", controller.update);
router.delete("/:id", requireRole("Admin"), deleteUser);

module.exports = router;
