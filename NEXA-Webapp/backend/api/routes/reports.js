const express = require("express");
const Report = require("../../models/report");
const createCrudController = require("../../controllers/crudFactory");

const router = express.Router();
const controller = createCrudController(Report);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
