import { permissions } from "../config/rbac.js";

export const authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Derive role code reliably from the loaded user (supports role object or string)
    let roleCode = null;
    if (typeof req.user.role === 'string') {
      roleCode = req.user.role;
    } else if (req.user.role && typeof req.user.role === 'object') {
      roleCode = req.user.role.code || req.user.role.name || null;
    }
    // Fallback: support role values from older tokens/user records.
    roleCode = roleCode || req.user.roleCode || null;

    if (!roleCode) {
      return res.status(403).json({ success: false, message: 'Access denied: no role' });
    }

    const allowed = permissions[permission];
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Access denied: unknown permission' });
    }

    const normalizedRoleCode = String(roleCode)
      .trim()
      .replace(/[\s-]+/g, "_")
      .toUpperCase();
    if (!allowed.map((r) => r.toUpperCase()).includes(normalizedRoleCode)) {
      return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
    }

    next();
  };
};

export default authorizePermission;
