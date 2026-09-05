import { sequelize } from "./db.js";
import { DataTypes } from "sequelize";
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

import Project from "../models/projectModel.js";
import User from "../models/userModel.js";
import { Resource } from "../models/Resource.js";

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
      connectTimeout: 10000,
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

const backfillResourceRelationships = async () => {
  const legacyResources = await Resource.findAll({
    where: {
      projectId: null,
      userId: null,
    },
  });
  let unmatched = 0;

  for (const resource of legacyResources) {
    const [projects, users] = await Promise.all([
      resource.projectTarget
        ? Project.findAll({ where: { name: resource.projectTarget } })
        : [],
      resource.employeeName
        ? User.findAll({ where: { name: resource.employeeName } })
        : [],
    ]);

    if (projects.length === 1 && users.length === 1) {
      await resource.update({ projectId: projects[0].id, userId: users[0].id });
    } else {
      unmatched += 1;
    }
  }

  if (unmatched > 0) {
    console.warn(
      `⚠️ ${unmatched} resource record(s) could not be safely matched to unique existing project/user records`
    );
  }
};

const initDB = async () => {
  try {
    await ensureDatabaseExists();

    await sequelize.authenticate();
    console.log("✅ Database connection established");

    await sequelize.sync({ alter: false });
    console.log("✅ All models synced successfully");

    await backfillResourceRelationships();
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export default initDB;
