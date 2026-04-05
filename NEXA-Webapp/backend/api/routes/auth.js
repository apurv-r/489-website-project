const express = require("express");
const passport = require("passport");
const authController = require("../../controllers/authController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

router.post("/register", authController.register);
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  authController.login,
);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;
