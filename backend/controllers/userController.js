import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";

// Add user (admin action)
export const addUser = async (req, res) => {
  try {
    const { name, email, password, roleId, role, department, avatar } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "User already exists" });

    // Allow supplying either a roleId (UUID) or a role code (string like PROJECT_MANAGER)
    let resolvedRole = null;
    if (roleId) {
      resolvedRole = await Role.findByPk(roleId);
      if (!resolvedRole) return res.status(404).json({ message: "Role not found (by id)" });
    } else if (role) {
      resolvedRole = await Role.findOne({ where: { code: role } });
      if (!resolvedRole) return res.status(404).json({ message: "Role not found (by code)" });
    } else {
      return res.status(400).json({ message: "role or roleId is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: resolvedRole.id,
      department,
      avatar,
    });

    res.status(201).json({ success: true, message: "User added successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users with roles
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: { model: Role, as: "role" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
