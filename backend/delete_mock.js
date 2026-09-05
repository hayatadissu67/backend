import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('project_db', 'root', 'YOUR_NEW_PASSWORD', { host: '127.0.0.1', dialect: 'mysql', logging: false });
await sequelize.query("DELETE FROM projects WHERE name NOT IN ('ProjectFlow PMO System', 'University Student Management System')");
console.log('Deleted fake projects');
process.exit(0);
