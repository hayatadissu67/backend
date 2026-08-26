const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');
const { validateEmail, validatePassword, sanitizeString } = require('../middleware/validation');

async function registerUser({ email, password, full_name, role }) {
  if (!validateEmail(email)) {
    const error = new Error('Invalid email format');
    error.status = 400;
    throw error;
  }

  if (!validatePassword(password)) {
    const error = new Error('Password must be at least 8 characters with uppercase, lowercase, and numbers');
    error.status = 400;
    throw error;
  }

  const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const cleanFullName = sanitizeString(full_name || email.split('@')[0], 100);
  const cleanRole = sanitizeString(role || 'member', 50);

  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
    [email, passwordHash, cleanFullName, cleanRole]
  );

  const userId = result?.insertId || result?.lastID || null;
  console.log('[DEBUG] Insert result:', JSON.stringify(result), 'userId:', userId);
  
  if (!userId) {
    const error = new Error('Failed to create user');
    error.status = 500;
    throw error;
  }

  // For SQLite, construct user object from insert data since SELECT might not see it immediately
  const user = {
    id: userId,
    email,
    full_name: cleanFullName,
    role: cleanRole
  };

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
  return { user, token };
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.status = 400;
    throw error;
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
    token,
  };
}

module.exports = {
  registerUser,
  loginUser,
};
