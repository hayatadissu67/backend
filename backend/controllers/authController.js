import { registerUser, loginUser } from '../services/authService.js';
import bcrypt from 'bcryptjs';
import Role from '../models/roleModel.js';
import User from '../models/userModel.js';

async function register(req, res) {
  try {
    const { user, token } = await registerUser(req.body);
    return res.status(201).json({ success: true, user, token });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
}

async function login(req, res) {
  try {
    const { user, token } = await loginUser(req.body);
    return res.json({ success: true, user, token });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
}

async function getCurrentUser(req, res) {
  const userJson = req.user.toJSON ? req.user.toJSON() : req.user;
  const { password, ...safeUser } = userJson;
  const role = safeUser.roleId
    ? await Role.findByPk(safeUser.roleId, { attributes: ['id', 'code', 'name'] })
    : null;
  return res.json({ success: true, user: { ...safeUser, role: role ? role.code : null } });
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
}

export { register, login, getCurrentUser, changePassword };
