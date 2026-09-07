import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";

const SAFE_USER_ATTRS = { exclude: ["password"] };

const serializeUser = (userInstance) => {
  if (!userInstance) return null;
  const json = userInstance.toJSON ? userInstance.toJSON() : { ...userInstance };
  const { password, ...safe } = json;
  return {
    ...safe,
    id: String(safe.id),
    roleId: safe.roleId ? String(safe.roleId) : null,
  };
};

const enrichWithRole = async (userJson) => {
  if (!userJson || !userJson.roleId) return { ...userJson, role: null };
  const role = await Role.findByPk(userJson.roleId, {
    attributes: ["id", "code", "name"],
  });
  return { ...userJson, role: role ? role.code : null };
};

const enrichUsersWithRole = async (users) => {
  const uniqueRoleIds = [
    ...new Set(
      users
        .map((u) => (u.toJSON ? u.toJSON().roleId : u.roleId))
        .filter(Boolean)
    ),
  ];
  const roles = await Role.findAll({
    where: { id: uniqueRoleIds },
    attributes: ["id", "code", "name"],
  });
  const roleMap = new Map(roles.map((r) => [String(r.id), r.code]));

  return users.map((u) => {
    const json = u.toJSON ? u.toJSON() : { ...u };
    const { password, ...safe } = json;
    return {
      ...safe,
      id: String(safe.id),
      role: roleMap.get(String(safe.roleId)) || null,
      roleId: safe.roleId ? String(safe.roleId) : null,
      mustChangePassword: !!safe.mustChangePassword,
      assignedProjectCodes: safe.assignedProjectCodes || [],
    };
  });
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
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

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

    const hashedPassword = await bcrypt.hash(password, 10);

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
      mustChangePassword: !!mustChangePassword,
    });

    const safe = await enrichWithRole(serializeUser(user));
    return res.status(201).json({
      success: true,
      message: "User added successfully",
      data: safe,
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
      order: [["createdAt", "DESC"]],
    });
    const safeUsers = await enrichUsersWithRole(users);
    return res.status(200).json({ success: true, data: safeUsers });
  } catch (error) {
    console.error("getUsers error:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// List only TEAM_MEMBER users
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
      order: [["name", "ASC"]],
    });
    const safeUsers = await enrichUsersWithRole(users);
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
      attributes: SAFE_USER_ATTRS,
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

    const safe = await enrichWithRole(serializeUser(user));
    return res.status(200).json({
      success: true,
      data: safe,
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