import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';
import Role from '../models/roleModel.js';
import User from '../models/userModel.js';
import { roles } from '../config/rbac.js';

const defaultUsers = [
  { name: 'Executive Manager', email: 'executive@pmo.com', password: 'Executive@123', roleCode: 'EXECUTIVE_MANAGER' },
  { name: 'Project Manager', email: 'pm@pmo.com', password: 'Project@123', roleCode: 'PROJECT_MANAGER' },
  { name: 'Risk Manager', email: 'risk@pmo.com', password: 'Risk@123', roleCode: 'RISK_MANAGER' },
  { name: 'Team Member', email: 'team@pmo.com', password: 'Team@123', roleCode: 'TEAM_MEMBER' },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection OK for seeding');

    // Ensure tables exist
    await sequelize.sync();

    // Seed roles
    const createdRoles = {};
    for (const r of roles) {
      const [role] = await Role.findOrCreate({ where: { code: r.code }, defaults: { name: r.name, description: r.name } });
      createdRoles[r.code] = role;
      console.log(`Seeded role: ${r.code}`);
    }

    // Seed users
    for (const u of defaultUsers) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (existing) {
        console.log(`User already exists: ${u.email}`);
        continue;
      }

      const hashed = await bcrypt.hash(u.password, 10);
      const role = createdRoles[u.roleCode];

      const newUser = await User.create({
        name: u.name,
        email: u.email,
        password: hashed,
        roleId: role ? role.id : null,
        department: 'PMO',
        status: 'Active',
      });

      console.log(`Created user: ${u.email} (role: ${u.roleCode})`);
    }

    console.log('✅ Seeding finished');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
