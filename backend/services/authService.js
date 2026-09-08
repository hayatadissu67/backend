import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';

const JWT_SECRET = () => process.env.JWT_SECRET || 'pmo-dev-secret-change-me-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const demoAccounts = [
  { id: 1, name: 'Executive Manager', email: 'executive@pmo.com', password: 'Executive@123', role: 'EXECUTIVE_MANAGER' },
  { id: 2, name: 'Project Manager', email: 'pm@pmo.com', password: 'Project@123', role: 'PROJECT_MANAGER' },
  { id: 3, name: 'Risk Manager', email: 'risk@pmo.com', password: 'Risk@123', role: 'RISK_MANAGER' },
  { id: 4, name: 'Team Member', email: 'team@pmo.com', password: 'Team@123', role: 'TEAM_MEMBER' },
];

const isDemoAuthEnabled = () => process.env.NODE_ENV !== 'production'
  && process.env.ALLOW_DEMO_LOGIN !== 'false';

const getDemoAccount = (email, password) => {
  if (!isDemoAuthEnabled()) return null;
  const account = demoAccounts.find((item) => item.email === email && item.password === password);
  if (!account) return null;
  const { password: ignoredPassword, ...safeAccount } = account;
  return {
    ...safeAccount,
    department: 'PMO',
    status: 'Active',
    assignedProjectCodes: [],
  };
};

export const getDemoAccountById = (id) => {
  if (!isDemoAuthEnabled()) return null;
  const account = demoAccounts.find((item) => item.id === Number(id));
  if (!account) return null;
  const { password: ignoredPassword, ...safeAccount } = account;
  return {
    ...safeAccount,
    department: 'PMO',
    status: 'Active',
    assignedProjectCodes: [],
  };
};

async function registerUser({ email, password, name, role }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }

  if (!role) {
    const error = new Error('role is required');
    error.status = 400;
    throw error;
  }

  const resolvedRole = await Role.findOne({ where: { code: role } });
  if (!resolvedRole) {
    const error = new Error(`Unknown role code: ${role}`);
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: passwordHash,
    name: name || email.split('@')[0],
    roleId: resolvedRole.id,
    status: 'Active',
    mustChangePassword: false,
  });

  const token = jwt.sign({ id: user.id }, JWT_SECRET(), { expiresIn: JWT_EXPIRE });

  const userJson = user.toJSON ? user.toJSON() : { ...user };
  const safeUser = {
    ...userJson,
    role: resolvedRole.code,
  };
  delete safeUser.password;

  return { user: safeUser, token };
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.status = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (user) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET(), { expiresIn: JWT_EXPIRE });

      const userJson = user.toJSON ? user.toJSON() : { ...user };
      const role = userJson.roleId
        ? await Role.findByPk(userJson.roleId, { attributes: ['id', 'code', 'name'] })
        : null;
      const safeUser = {
        ...userJson,
        role: role ? role.code : null,
      };
      delete safeUser.password;

      return { user: safeUser, token };
    }
  } catch (error) {
    if (error.status) throw error;
  }

  const demoUser = getDemoAccount(normalizedEmail, password);
  if (demoUser) {
    const token = jwt.sign({ id: demoUser.id, demo: true }, JWT_SECRET(), { expiresIn: JWT_EXPIRE });
    return { user: demoUser, token };
  }

  const error = new Error('Invalid credentials');
  error.status = 401;
  throw error;
}

export { registerUser, loginUser };
