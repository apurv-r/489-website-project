const express = require("express");
const Report = require("../../models/report");
const createCrudController = require("../../controllers/crudFactory");
const requireRole = require("../../middleware/requireRole");

const router = express.Router();
const controller = createCrudController(Report);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", requireRole("Admin"), controller.update);
router.delete("/:id", requireRole("Admin"), controller.remove);

module.exports = router;
