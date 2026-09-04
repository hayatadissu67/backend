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

    try {
      await sequelize.sync({ alter: true });
      console.log("✅ All models synced successfully (alter)");
    } catch (syncErr) {
      // Handle MySQL 'Too many keys specified' when running ALTER operations
      if (
        syncErr &&
        (syncErr.parent && syncErr.parent.code === "ER_TOO_MANY_KEYS")
      ) {
        console.warn(
          "⚠️ Too many keys for ALTER; falling back to non-alter sync to avoid index errors"
        );
        await sequelize.sync();
        console.log("✅ All models synced successfully (fallback)");
      } else {
        throw syncErr;
      }
    }
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export default initDB;