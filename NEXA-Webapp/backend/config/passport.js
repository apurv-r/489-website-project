const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const User = require("../models/user");

function getJwtSecret() {
  return process.env.JWT_SECRET || "nexa-dev-secret";
}

function configurePassport() {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false,
      },
      async (email, password, done) => {
        try {
          const normalizedEmail = String(email || "")
            .trim()
            .toLowerCase();
          const user = await User.findOne({ email: normalizedEmail });

          if (!user) {
            return done(null, false, { message: "Invalid credentials" });
          }

          const matches = await user.comparePassword(password);

          if (!matches) {
            return done(null, false, { message: "Invalid credentials" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: getJwtSecret(),
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.sub);

          if (!user) {
            return done(null, false);
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );

  return passport;
}

module.exports = {
  passport,
  configurePassport,
  getJwtSecret,
};
