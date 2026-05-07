// Authentication middleware (optional - for future JWT implementation)

const authMiddleware = (req, res, next) => {
  // For now, we'll skip authentication middleware
  // You can implement JWT token verification here later
  next();
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // For now, we'll skip role checking
    // You can implement role-based access control here later
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole
};
