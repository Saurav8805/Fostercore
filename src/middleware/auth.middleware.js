// Authentication middleware

const { hasPermission } = require('../config/auth');

const authMiddleware = (req, res, next) => {
  // For now, we'll skip authentication middleware
  // You can implement JWT token verification here later
  next();
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // For now, we'll skip role checking
    // You can implement role-based access control here later
    // Example implementation:
    // const userRole = req.user?.role;
    // if (!allowedRoles.includes(userRole)) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }
    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    // For future implementation with session/JWT
    // const userRole = req.user?.role;
    // if (!hasPermission(userRole, permission)) {
    //   return res.status(403).json({ error: 'Permission denied' });
    // }
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
  requirePermission
};
