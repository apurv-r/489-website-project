function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // Default keeps behavior predictable if a user object exists without roleType.
    const userRole = req.user?.roleType || "User";

    if (!allowedRoles.includes(userRole)) {
      // 403 Forbidden: user is authenticated but lacks required role.
      return res.status(403).json({
        message: `Only ${allowedRoles.join(", ")} can access this`,
        allowedRoles: allowedRoles,
      });
    }

    next();
  };
}

module.exports = requireRole;
