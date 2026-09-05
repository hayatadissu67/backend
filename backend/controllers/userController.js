import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";

const SAFE_USER_ATTRS = { exclude: ["password"] };

// Helper: serialize a Sequelize user instance into a plain object
// that the frontend can consume (id as string, role as plain string code).
const serializeUser = (userInstance) => {
  if (!userInstance) return null;
  const json = userInstance.toJSON ? userInstance.toJSON() : { ...userInstance };
  const { password, ...safe } = json;
  if (safe.role && typeof safe.role === "object") {
    safe.role = safe.role.code || safe.role.name;
  }
  return {
    ...safe,
    id: String(safe.id),
    roleId: safe.roleId ? String(safe.roleId) : null,
  };
};

// Add user (admin action)
export const addUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      tempPassword,
      roleId,
      role,
      department,
      avatar,
      status,
      mustChangePassword,
    } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Allow supplying either a roleId (UUID) or a role code (string like PROJECT_MANAGER)
    let resolvedRole = null;
    if (roleId) {
      resolvedRole = await Role.findByPk(roleId);
      if (!resolvedRole) {
        return res
          .status(404)
          .json({ success: false, message: "Role not found (by id)" });
      }
    } else if (role) {
      resolvedRole = await Role.findOne({ where: { code: role } });
      if (!resolvedRole) {
        return res
          .status(404)
          .json({ success: false, message: "Role not found (by code)" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "role or roleId is required" });
    }

    // If no password is provided, generate a secure temporary one.
    let plainPassword = password || tempPassword;
    let generatedTemp = false;
    if (!plainPassword) {
      plainPassword = crypto
        .randomBytes(6)
        .toString("base64")
        .replace(/[^A-Za-z0-9]/g, "A")
        .slice(0, 10);
      generatedTemp = true;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: resolvedRole.id,
      department: department || "Unassigned",
      avatar:
        avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      status: status || "Active",
      mustChangePassword: generatedTemp || mustChangePassword === true,
    });

    const safe = serializeUser(user);

    return res.status(201).json({
      success: true,
      message: "User added successfully",
      data: safe,
      temporaryPassword: generatedTemp ? plainPassword : undefined,
    });
  } catch (error) {
    console.error("addUser error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// Get all users with roles
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: SAFE_USER_ATTRS,
      include: { model: Role, as: "role", attributes: ["id", "code", "name"] },
      order: [["createdAt", "DESC"]],
    });
    const safeUsers = users.map((u) => {
      const j = u.toJSON();
      // Normalize role: prefer the code string the frontend expects.
      const roleCode = j.role ? j.role.code : null;
      return {
        id: String(j.id),
        name: j.name,
        email: j.email,
        department: j.department || "Unassigned",
        avatar: j.avatar,
        status: j.status || "Active",
        role: roleCode,
        roleId: j.roleId ? String(j.roleId) : null,
        mustChangePassword: !!j.mustChangePassword,
        assignedProjectCodes: j.assignedProjectCodes || [],
      };
    });
    return res.status(200).json({ success: true, data: safeUsers });
  } catch (error) {
    console.error("getUsers error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// List only TEAM_MEMBER users. Accessible to any authenticated user.
// Used by the PM dashboard / "assign member" flow so PMs can see the
// full pool of team members without needing full user-management rights.
export const getTeamMembers = async (req, res) => {
  try {
    const teamRole = await Role.findOne({ where: { code: "TEAM_MEMBER" } });
    if (!teamRole) {
      return res
        .status(404)
        .json({ success: false, message: "TEAM_MEMBER role not configured" });
    }
    const users = await User.findAll({
      attributes: SAFE_USER_ATTRS,
      where: { roleId: teamRole.id },
      include: { model: Role, as: "role", attributes: ["id", "code", "name"] },
      order: [["name", "ASC"]],
    });
    const safeUsers = users.map((u) => {
      const j = u.toJSON();
      return {
        id: String(j.id),
        name: j.name,
        email: j.email,
        department: j.department || "Unassigned",
        avatar: j.avatar,
        status: j.status || "Active",
        role: j.role ? j.role.code : "TEAM_MEMBER",
        roleId: j.roleId ? String(j.roleId) : null,
        mustChangePassword: !!j.mustChangePassword,
        assignedProjectCodes: j.assignedProjectCodes || [],
      };
    });
    return res.status(200).json({ success: true, data: safeUsers });
  } catch (error) {
    console.error("getTeamMembers error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: { model: Role, as: "role", attributes: ["id", "code", "name"] },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { name, email, department, avatar, status, role, roleId } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (department !== undefined) user.department = department;
    if (avatar !== undefined) user.avatar = avatar;
    if (status !== undefined) user.status = status;

    if (roleId) {
      const r = await Role.findByPk(roleId);
      if (!r) {
        return res
          .status(404)
          .json({ success: false, message: "Role not found (by id)" });
      }
      user.roleId = r.id;
    } else if (role) {
      const r = await Role.findOne({ where: { code: role } });
      if (!r) {
        return res
          .status(404)
          .json({ success: false, message: "Role not found (by code)" });
      }
      user.roleId = r.id;
    }

    await user.save();

    // Reload with role joined
    const fresh = await User.findByPk(user.id, {
      include: { model: Role, as: "role", attributes: ["id", "code", "name"] },
    });
    const j = fresh.toJSON();
    return res.status(200).json({
      success: true,
      data: {
        id: String(j.id),
        name: j.name,
        email: j.email,
        department: j.department || "Unassigned",
        avatar: j.avatar,
        status: j.status || "Active",
        role: j.role ? j.role.code : null,
        roleId: j.roleId ? String(j.roleId) : null,
        mustChangePassword: !!j.mustChangePassword,
        assignedProjectCodes: j.assignedProjectCodes || [],
      },
    });
  } catch (error) {
    console.error("updateUser error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// Update only the status field
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "status is required" });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.status = status;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Status updated",
      data: { id: String(user.id), status: user.status },
    });
  } catch (error) {
    console.error("updateUserStatus error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await user.destroy();
    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};