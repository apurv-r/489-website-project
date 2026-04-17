const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Host = require("../models/host");
const Renter = require("../models/renter");
const Admin = require("../models/admin");
const { getJwtSecret } = require("../config/passport");
const {
  issueSession,
  destroySession,
  clearSessionCookie,
} = require("../middleware/sessionAuth");

function signToken(user) {
  // Transitional compatibility: JWT is still returned for older clients,
  // even though session cookies are now the primary auth mechanism.
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      roleType: user.roleType,
    },
    getJwtSecret(),
    { expiresIn: "7d" },
  );
}

function sanitizeUser(user) {
  return user.toJSON ? user.toJSON() : user;
}

function getModelForRoleType(roleType) {
  switch (String(roleType || "").toLowerCase()) {
    case "host":
      return Host;
    case "renter":
      return Renter;
    case "admin":
      return Admin;
    default:
      return User;
  }
}

async function register(req, res, next) {
  try {
    const { roleType, ...userData } = req.body;
    const Model = getModelForRoleType(roleType);
    const user =
      Model === User
        ? await Model.create(userData)
        : await Model.create({ ...userData, roleType: Model.modelName });

    const originIP = req.headers.origin;
    issueSession(res, user, originIP);
    const token = signToken(user);

    // 201 Created: a new user account was successfully created.
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    // Creates/refreshes the server-side session and sends session cookie.
    const originIP = req.headers.origin;
    issueSession(res, req.user, originIP);
    const token = signToken(req.user);
    req.user.lastLoginAt = new Date();
    await req.user.save();

    res.json({ user: sanitizeUser(req.user), token });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    if (req.sessionId) {
      destroySession(req.sessionId);
    }

    clearSessionCookie(res);
    // 204 No Content: logout succeeded and there is no response body.
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

module.exports = {
  register,
  login,
  logout,
  me,
};
