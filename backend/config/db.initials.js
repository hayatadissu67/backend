import { sequelize } from "./db.js";
import mysql from "mysql2/promise";

import "../models/reportModel.js";
import "../models/templateModel.js";
import "../models/portfolioModel.js";
import "../models/budgetModel.js";
import "../models/changeRequestModel.js";
import "../models/roleModel.js";
import "../models/userModel.js";
import "../models/association.js";
import "../models/projectModel.js";
import "../models/riskModel.js";
import "../models/Resource.js";

const ensureDatabaseExists = async () => {
  const dbName = process.env.DB_NAME || "pmo";
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "ha123";

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`
    );
    await connection.end();

    console.log(`✅ Ensured database '${dbName}' exists`);
  } catch (err) {
    console.error("❌ Could not ensure database exists:", err.message || err);
    throw err;
  }
};

const initDB = async () => {
  try {
    // Make sure the database exists before letting Sequelize connect
    await ensureDatabaseExists();

    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Try a non-altering sync first. This avoids the MySQL "ER_TOO_MANY_KEYS"
    // (errno 1069) error that ALTER-heavy syncs can trigger on InnoDB tables
    // that already exist or have a high column/index count. The non-alter
    // sync only creates missing tables and does not touch existing schemas.
    try {
      await sequelize.sync({ alter: false });
      console.log("✅ All models synced successfully");
    } catch (syncErr) {
      // Handle MySQL 'Too many keys specified' as a final safety net:
      // retry without index management if it ever surfaces.
      if (
        syncErr &&
        syncErr.parent &&
        (syncErr.parent.code === "ER_TOO_MANY_KEYS" || syncErr.parent.errno === 1069)
      ) {
        console.warn(
          "⚠️ Too many keys detected during sync; retrying with indexes disabled"
        );
        await sequelize.sync({ alter: false, indexes: false });
        console.log("✅ All models synced successfully (indexes skipped)");
      } else {
        throw syncErr;
      }
    }
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export default initDB;