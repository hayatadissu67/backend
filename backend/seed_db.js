import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

async function setup() {
  const sequelize = new Sequelize('project_db', 'root', 'YOUR_NEW_PASSWORD', {
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false
  });

  const hash = await bcrypt.hash('password123', 10);
  
  const users = [
    { name: 'Elena Team', email: 'elena@pmo.com', role: 'TEAM_MEMBER' },
    { name: 'Alex PM', email: 'alex@pmo.com', role: 'PROJECT_MANAGER' },
    { name: 'Marcus RM', email: 'marcus@pmo.com', role: 'RISK_MANAGER' }
  ];

  for (let u of users) {
    try {
      await sequelize.query(`INSERT IGNORE INTO users (name, email, password, role, department, status, createdAt, updatedAt) VALUES ('${u.name}', '${u.email}', '${hash}', '${u.role}', 'IT', 'Active', NOW(), NOW())`);
    } catch (e) {
      console.log(e.message);
    }
  }

  // Insert Project and Team
  await sequelize.query(`INSERT IGNORE INTO projects (id, name, code, department, owner, createdAt, updatedAt) VALUES (UUID(), 'Test Proj', 'PRJ-101', 'IT', 'alex@pmo.com', NOW(), NOW())`);
  
  const [tm] = await sequelize.query(`SELECT id FROM users WHERE email='elena@pmo.com'`);
  if (tm.length > 0) {
    await sequelize.query(`INSERT IGNORE INTO project_team (userId, projectCode, createdAt, updatedAt) VALUES (${tm[0].id}, 'PRJ-101', NOW(), NOW())`);
  }
  
  console.log("DB seeded.");
  process.exit(0);
}

setup();
