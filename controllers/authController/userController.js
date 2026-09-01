import bcrypt from "bcryptjs";
import User from "../models/authModel/userModel.js";
import Role from "../models/authModel/roleModel.js";

// Add user (admin action)
export const addUser = async (req, res) => {
  try {
    const { name, email, password, roleId, department, avatar } = req.body;

    if (!email || !password || !roleId) {
      return res.status(400).json({
        message: "Email, password, and roleId are required",
      });
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const role = await Role.findByPk(roleId);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId,
      department,
      avatar,
    });

    return res.status(201).json({
      message: "User added successfully",
      user,
    });
  } catch (error) {
    console.error("Add user error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get all users with roles
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Role,
        as: "role",
      },
    });

    return res.json(users);
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};