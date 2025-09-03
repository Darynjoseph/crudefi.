const { permissions } = require('../config/roles');

function checkPermission(module, action) {
  return (req, res, next) => {
    try {
      const user = req.user || { role: 'viewer' }; // simulate if not logged in
      const allowedRoles = permissions[module]?.[action] || [];

      if (allowedRoles.includes(user.role)) {
        next();
      } else {
        return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
      }
    } catch (err) {
      console.error('Permission error:', err);
      return res.status(500).json({ message: 'Permission check failed' });
    }
  };
}

module.exports = checkPermission;
