import User from "../models/userModel.js";
import Role from "../models/roleModel.js";

// Add user (admin action)
export const addUser = async (req, res) => {
  try {
    const { name, email, password, roleId, department, avatar } = req.body;

    if (!email || !password || !roleId) {
      return res.status(400).json({ message: "Email, password, and roleId are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "User already exists" });

    const role = await Role.findByPk(roleId);
    if (!role) return res.status(404).json({ message: "Role not found" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId,
      department,
      avatar,
    });

    res.status(201).json({ message: "User added successfully", user });
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
