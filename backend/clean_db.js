import { Sequelize } from 'sequelize';

async function cleanDb() {
  const sequelize = new Sequelize('project_db', 'root', 'YOUR_NEW_PASSWORD', {
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false
  });

  try {
    await sequelize.query(`DELETE FROM risks WHERE ref IN ('RSK-999', 'RSK-998', 'RSK-TEST-A', 'RSK-TEST-B') OR ref LIKE 'RSK-TEST%' OR ref LIKE 'R-%'`);
    console.log("Test risks deleted from database.");
  } catch (e) {
    console.log("Error cleaning DB", e.message);
  }
  process.exit(0);
}

cleanDb();
