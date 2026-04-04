const express = require("express");
const ParkingSpace = require("../../models/parkingSpace");
const createCrudController = require("../../controllers/crudFactory");

const router = express.Router();
const controller = createCrudController(ParkingSpace);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
