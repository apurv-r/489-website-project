const express = require("express");
const ParkingSpace = require("../../models/parkingSpace");
const createCrudController = require("../../controllers/crudFactory");
const parkingSpaceController = require("../../controllers/parkingSpaceController");
const requireRole = require("../../middleware/requireRole");

const router = express.Router();
const controller = createCrudController(ParkingSpace);

router.get(
  "/me",
  requireRole("Host", "Admin"),
  parkingSpaceController.listMine,
);
router.post("/", requireRole("Host", "Admin"), controller.create);
router.put("/:id", requireRole("Host", "Admin"), controller.update);
router.delete("/:id", requireRole("Host", "Admin"), controller.remove);

module.exports = router;
