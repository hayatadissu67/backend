import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load user including their role
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Role, as: "role", attributes: ["id", "code", "name"] }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message || error);
    return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const userRoleCode = req.user.role && (req.user.role.code || req.user.role.name);

    if (!userRoleCode) {
      return res.status(403).json({ success: false, message: "Access denied: no role assigned" });
    }

    const allowed = allowedRoles.map((r) => r.toString().toLowerCase());
    if (!allowed.includes(String(userRoleCode).toLowerCase())) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient permissions" });
    }

    next();
  };
};