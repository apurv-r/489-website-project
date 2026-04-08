const express = require("express");
const passport = require("passport");
const authController = require("../../controllers/authController");
const requireAuth = require("../../middleware/requireAuth");

const router = express.Router();

// Example: POST /api/auth/register with JSON body
// { "email": "user@example.com", "password": "secret123", "firstName": "Ava", "lastName": "Lee", "roleType": "Renter" }
router.post("/register", authController.register);

// Example: POST /api/auth/login with JSON body
// { "email": "user@example.com", "password": "secret123" }
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  authController.login,
);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;