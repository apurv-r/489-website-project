const express = require("express");
const Report = require("../../models/report");
const createCrudController = require("../../controllers/crudFactory");
const requireRole = require("../../middleware/requireRole");

const router = express.Router();
const controller = createCrudController(Report);

router.get("/", async (req, res, next) => {
  try {
    const reports = await Report.find(req.query || {})
      .populate("reporter", "firstName lastName email roleType")
      .populate("reportedUser", "firstName lastName email roleType")
      .populate("reportedSpace", "title parkingType host createdAt")
      .populate("booking", "startDate endDate status totalAmount parkingSpace")
      .populate("reviewedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reporter", "firstName lastName email roleType")
      .populate("reportedUser", "firstName lastName email roleType")
      .populate("reportedSpace", "title parkingType host createdAt")
      .populate("booking", "startDate endDate status totalAmount parkingSpace")
      .populate("reviewedBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireRole("Admin"), async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Not found" });
    }

    const updatableFields = [
      "status",
      "resolutionNotes",
      "title",
      "category",
      "description",
      "reportedUser",
      "reportedSpace",
      "booking",
    ];

    updatableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        report[field] = req.body[field];
      }
    });

    if (Object.prototype.hasOwnProperty.call(req.body, "status")) {
      report.reviewedBy = req.user?._id || report.reviewedBy;
      report.reviewedAt = new Date();
    }

    await report.save();

    const populated = await Report.findById(report._id)
      .populate("reporter", "firstName lastName email roleType")
      .populate("reportedUser", "firstName lastName email roleType")
      .populate("reportedSpace", "title parkingType host createdAt")
      .populate("booking", "startDate endDate status totalAmount parkingSpace")
      .populate("reviewedBy", "firstName lastName email");

    res.json(populated);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const created = await Report.create({
      ...req.body,
      reporter: req.user?._id,
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});
router.put("/:id", requireRole("Admin"), controller.update);
router.delete("/:id", requireRole("Admin"), controller.remove);

module.exports = router;
