import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize } from '../config/db.js';
import { JWT_SECRET, JWT_EXPIRE } from '../env.js';
import { validateEmail, validatePassword, sanitizeString } from '../middleware/validation.js';
import User from '../models/authModel/userModel.js';

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

  const [existing] = await sequelize.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const cleanFullName = sanitizeString(full_name || email.split('@')[0], 100);
  const cleanRole = sanitizeString(role || 'member', 50);

  const [result] = await sequelize.query(
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
  try{

    if (!email || !password) {
    const error = new Error('Email and password are required');
    error.status = 400;
    throw error;
  }
  
  const user = await User.findOne({
    where: { email },
    attributes: ['id', 'email', 'name', 'roleId', 'password'],
  });

  console.log('User found: 👍👍', user);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const error = new Error('Invalid credentials kkk');
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
catch (error) {
  console.error('Login error: 🤣🤣🤣', error);
  throw error;
}
}

export {
  registerUser,
  loginUser,
};
