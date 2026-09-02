import "dotenv/config";
import { sequelize } from "./config/db.js";

const checkData = async () => {
  try {
    const [users] = await sequelize.query('SELECT name, email, role FROM users');
    const [projects] = await sequelize.query('SELECT name, owner FROM projects');
    const [tasks] = await sequelize.query('SELECT title, assignee FROM tasks');
    const [risks] = await sequelize.query('SELECT subject, owner FROM risks');

    console.log("USERS:", users.length);
    console.log(users);
    
    console.log("PROJECTS:", projects.length);
    console.log(projects);

    console.log("TASKS:", tasks.length);
    console.log(tasks);

    console.log("RISKS:", risks.length);
    console.log(risks);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkData();
