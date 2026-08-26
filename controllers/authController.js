const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { user, token } = await authService.registerUser(req.body);
    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const { user, token } = await authService.loginUser(req.body);
    return res.json({ user, token });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

async function getCurrentUser(req, res) {
  return res.json(req.user);
}

module.exports = {
  register,
  login,
  getCurrentUser,
};
