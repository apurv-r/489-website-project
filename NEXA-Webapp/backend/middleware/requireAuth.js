const passport = require("passport");

function requireAuth(req, res, next) {
  // Primary path: user already attached via session cookie middleware.
  if (req.user) {
    return next();
  }

  // Fallback path: still accept Bearer JWT for backward compatibility.
  return passport.authenticate("jwt", { session: false })(req, res, next);
}

module.exports = requireAuth;
