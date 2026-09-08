import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || "pmo-dev-secret-change-me-in-production";
    const decoded = jwt.verify(token, secret);

    // Find user from token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Load role separately to avoid eager-loading association issues
    let role = null;
    if (user.roleId) {
      try {
        role = await Role.findByPk(user.roleId, {
          attributes: ["id", "code", "name"],
        });
      } catch (roleErr) {
        console.error("Role lookup failed:", roleErr.message);
      }
    }

    req.user = {
      ...user.toJSON(),
      role: role ? role.code : null,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "User role not found",
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
