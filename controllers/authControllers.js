import { registerUser, loginUser } from '../services/authService.js';

async function register(req, res) {
  try {
    const { user, token } = await registerUser(req.body);
    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const { user, token } = await loginUser(req.body);
    return res.json({ user, token });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

async function getCurrentUser(req, res) {
  return res.json(req.user);
}

export {
  register,
  login,
  getCurrentUser,
};
