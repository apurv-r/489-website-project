const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        res.json({ message: "hello from apurv's backend" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Test route failed" });
    }
});

module.exports = router;
