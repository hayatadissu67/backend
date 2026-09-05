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

    // Load user including their role — fall back to plain lookup if FK join fails
    let user;
    try {
      user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
        include: [{ model: Role, as: "role", attributes: ["id", "code", "name"] }],
      });
    } catch (joinErr) {
      // FK schema conflict on the shared DB can cause the JOIN to fail.
      // Fall back to loading the user without the role join.
      user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });
    }

<<<<<<< HEAD
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: ['role']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
=======
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
>>>>>>> aa592568bb6d78f2d31bb02ac268b220f3f0ade9
    }

    // Attach user to request, mapping role safely
    req.user = user.toJSON();
    if (user.role) {
      req.user.role = user.role.code;
    } else if (decoded.role) {
      req.user.role = decoded.role;
    }

    next();
<<<<<<< HEAD
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "User role not found in request",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
=======
>>>>>>> aa592568bb6d78f2d31bb02ac268b220f3f0ade9
  };
};