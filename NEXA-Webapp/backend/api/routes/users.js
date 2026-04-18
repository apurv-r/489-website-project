const express = require("express");
const User = require("../../models/user");
const Host = require("../../models/host");
const createCrudController = require("../../controllers/crudFactory");
const requireRole = require("../../middleware/requireRole");

const router = express.Router();
const controller = createCrudController(User);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
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
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
