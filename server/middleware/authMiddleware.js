const roles = require('../config/roles');

/**
 * Enhanced middleware for role-based access control using permissions from config/roles.js
 * Usage: requirePermission('petty_cash', 'create')
 */
function requirePermission(resource, action) {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        success: false 
      });
    }

    // Check if resource exists in permissions
    if (!roles.permissions[resource]) {
      return res.status(400).json({ 
        message: `Invalid resource: ${resource}`,
        success: false 
      });
    }

    // Check if action exists for the resource
    if (!roles.permissions[resource][action]) {
      return res.status(400).json({ 
        message: `Invalid action: ${action} for resource: ${resource}`,
        success: false 
      });
    }

    // Check if user's role has permission for this action
    const allowedRoles = roles.permissions[resource][action];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required permissions: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        success: false,
        required_roles: allowedRoles,
        user_role: req.user.role
      });
    }

    next();
  };
}

/**
 * Simple role check middleware (backwards compatible)
 * Usage: requireRoles('admin', 'manager')
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        success: false 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        success: false,
        required_roles: allowedRoles,
        user_role: req.user.role
      });
    }

    next();
  };
}

/**
 * Check if user has admin privileges
 */
function requireAdmin(req, res, next) {
  return requireRoles('admin')(req, res, next);
}

/**
 * Check if user has manager or higher privileges
 */
function requireManager(req, res, next) {
  return requireRoles('admin', 'manager')(req, res, next);
}

/**
 * Utility function to check permissions programmatically
 */
function hasPermission(userRole, resource, action) {
  if (!roles.permissions[resource] || !roles.permissions[resource][action]) {
    return false;
  }
  return roles.permissions[resource][action].includes(userRole);
}

/**
 * Middleware to add permission checking utilities to request object
 */
function addPermissionHelpers(req, res, next) {
  if (req.user) {
    req.user.hasPermission = (resource, action) => {
      return hasPermission(req.user.role, resource, action);
    };
    
    req.user.isAdmin = () => req.user.role === 'admin';
    req.user.isManager = () => ['admin', 'manager'].includes(req.user.role);
    req.user.isStaff = () => ['admin', 'manager', 'staff'].includes(req.user.role);
  }
  next();
}

module.exports = {
  requirePermission,
  requireRoles,
  requireAdmin,
  requireManager,
  hasPermission,
  addPermissionHelpers
};