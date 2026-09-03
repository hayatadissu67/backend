import { Sequelize } from 'sequelize';

async function queryDB() {
  const sequelize = new Sequelize('project_db', 'root', 'YOUR_NEW_PASSWORD', {
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false
  });

  try {
    const results = await sequelize.query(`SELECT * FROM project_team`);
    console.log("ProjectTeam rows:", results[0]);
  } catch (e) {
    console.log("Error querying DB", e.message);
  }
  process.exit(0);
}

queryDB();
