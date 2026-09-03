import User from "../../models/authModel/userModel.js";
import ProjectTeam from "../../models/projectModel/ProjectTeam.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  try {
    const { name, email, role, department, status, avatar, assignedProjectCodes } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists." });
    }

    // Auto-generate a password for the new user (in a real app, send email)
    const temporaryPassword = Math.random().toString(36).slice(-8) + "A1!";
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      status: status || "Active",
      avatar
    });

    // If projects are assigned, link them
    if (assignedProjectCodes && assignedProjectCodes.length > 0) {
      const assignments = assignedProjectCodes.map(code => ({
        userId: newUser.id,
        projectCode: code
      }));
      await ProjectTeam.bulkCreate(assignments);
    }

    const userData = newUser.toJSON();
    delete userData.password;
    userData.assignedProjectCodes = assignedProjectCodes || [];
    userData.projectsAssigned = assignedProjectCodes ? assignedProjectCodes.length : 0;

    res.status(201).json({
      success: true,
      data: userData,
      temporaryPassword
    });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Failed to create user." });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });

    const projectTeams = await ProjectTeam.findAll();

    const formattedUsers = users.map(user => {
      const u = user.toJSON();
      const userProjects = projectTeams.filter(pt => pt.userId === u.id);
      u.assignedProjectCodes = userProjects.map(pt => pt.projectCode);
      u.projectsAssigned = userProjects.length;
      return u;
    });

    res.status(200).json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ success: true, data: { id: user.id, status: user.status } });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ success: false, message: "Failed to update user status." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await user.destroy();
    // Cascade delete in ProjectTeam could be added if not set in model
    await ProjectTeam.destroy({ where: { userId: id } });

    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user." });
  }
};
