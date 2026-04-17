const crypto = require("crypto");

const User = require("../models/user");

const SESSION_COOKIE_NAME = "nexa_session_id";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory session store (for dev purposes only)
const sessions = new Map();

function parseCookies(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function createSession(userId, originIP = null) {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, {
    userId: userId.toString(),
    createdAt: Date.now(),
    originIP: originIP,
  });
  return sessionId;
}

function destroySession(sessionId) {
  if (!sessionId) {
    return;
  }

  sessions.delete(sessionId);
}

function clearSessions() {
  sessions.clear();
}

function setSessionCookie(res, sessionId) {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    // HttpOnly prevents client-side JS from reading the session id.
    httpOnly: true,
    // Lax helps protect against CSRF for cross-site form/navigation requests.
    sameSite: "lax",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

function clearSessionCookie(res) {
  res.cookie(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

async function loadSessionUser(req, res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies[SESSION_COOKIE_NAME];

    if (!sessionId) {
      return next();
    }

    const session = sessions.get(sessionId);
    if (!session) {
      // Session id no longer exists server-side; clear stale cookie client-side.
      clearSessionCookie(res);
      return next();
    }

    const user = await User.findById(session.userId);
    if (!user) {
      // If user was removed, invalidate session and clear cookie.
      destroySession(sessionId);
      clearSessionCookie(res);
      return next();
    }

    req.sessionId = sessionId;
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

function issueSession(res, user, originIP = null) {
  const sessionId = createSession(user._id, originIP);
  setSessionCookie(res, sessionId);
  return sessionId;
}

module.exports = {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  clearSessions,
  createSession,
  destroySession,
  issueSession,
  loadSessionUser,
  parseCookies,
};
