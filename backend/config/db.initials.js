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

const ensureResourceSchema = async () => {
  const queryInterface = sequelize.getQueryInterface();
  if (!(await queryInterface.tableExists("resources"))) {
    return;
  }

  const columns = await queryInterface.describeTable("resources");

  if (!columns.projectId) {
    await queryInterface.addColumn("resources", "projectId", {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "projects", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  }

  if (!columns.userId) {
    await queryInterface.addColumn("resources", "userId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  }

  if (!columns.approvalComment) {
    await queryInterface.addColumn("resources", "approvalComment", {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  }

  if (!columns.rejectionComment) {
    await queryInterface.addColumn("resources", "rejectionComment", {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  }
};

// Ensures the parentTaskId column exists in the tasks table for sub-task support.
// Done explicitly so it works even when sync({ alter: true }) falls back.
const ensureTaskSchema = async () => {
  const queryInterface = sequelize.getQueryInterface();
  if (!(await queryInterface.tableExists("tasks"))) {
    return;
  }

  const columns = await queryInterface.describeTable("tasks");

  if (!columns.parentTaskId) {
    await queryInterface.addColumn("tasks", "parentTaskId", {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      after: "description",
    });
    console.log("✅ tasks.parentTaskId column added");
  }

  if (!columns.progressUpdatedAt) {
    await queryInterface.addColumn("tasks", "progressUpdatedAt", {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      after: "parentTaskId",
    });
    console.log("✅ tasks.progressUpdatedAt column added");
  }
};

const initDB = async () => {
  try {
    await ensureDatabaseExists();

    await sequelize.authenticate();
    console.log("✅ Database connection established");

    await ensureResourceSchema();
    console.log("✅ Resource relationship columns ensured");

    await ensureTaskSchema();
    console.log("✅ Task schema columns ensured");

    // The shared `users` table has a pre-existing FK constraint conflict
    // (ER_FK_COLUMN_NOT_NULL on roleId) that blocks ALTER TABLE.
    // Strategy: sync every model individually with alter:true, skip User
    // on error and fall back to plain sync for that model only.
    const models = Object.values(sequelize.models);
    for (const model of models) {
      try {
        await model.sync({ alter: true });
      } catch (modelSyncErr) {
        const errCode =
          modelSyncErr?.parent?.code ||
          modelSyncErr?.original?.code ||
          modelSyncErr?.code;

        const knownAlterErrors = [
          "ER_TOO_MANY_KEYS",
          "ER_FK_INCOMPATIBLE_COLUMNS",
          "ER_FK_COLUMN_NOT_NULL",
        ];

        if (knownAlterErrors.includes(errCode)) {
          console.warn(
            `⚠️ ALTER skipped for model '${model.name}' (${errCode}); ` +
            "using plain sync to preserve existing schema."
          );
          await model.sync();
        } else {
          throw modelSyncErr;
        }
      }
    }
    console.log("✅ All models synced successfully");

    await backfillResourceRelationships();
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export default initDB;