import { registerUser, loginUser } from '../services/authService.js';
import Role from '../models/roleModel.js';

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
  return res.json({ success: true, user: { ...safeUser, role: role ? role.code : safeUser.role || null } });
}

export { register, login, getCurrentUser };
