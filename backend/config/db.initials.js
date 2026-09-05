import { dbConfig, sequelize } from "./db.js";
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
import "../models/executiveRequestModel.js";
import "../models/auditLogModel.js";

const ensureDatabaseExists = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`
    );
    await connection.end();

    console.log(`✅ Ensured database '${dbConfig.database}' exists`);
  } catch (err) {
    console.error("❌ Could not ensure database exists:", err.message || err);
    throw err;
  }
};

const repairRoleIdColumn = async () => {
  const [columns] = await sequelize.query(
    "SHOW COLUMNS FROM `users` LIKE 'roleId'"
  );

  if (columns.length > 0) {
    await sequelize.query(
      "ALTER TABLE `users` MODIFY COLUMN `roleId` CHAR(36) BINARY NULL"
    );
  }
};

const removeDuplicateUserEmailIndexes = async () => {
  const [indexes] = await sequelize.query(
    "SHOW INDEX FROM `users` WHERE Key_name LIKE 'email\\_%'"
  );

  for (const index of indexes) {
    try {
      await sequelize.query(
        `ALTER TABLE \`users\` DROP INDEX \`${index.Key_name}\``
      );
    } catch (error) {
      if (error.parent?.code !== "ER_CANT_DROP_FIELD_OR_KEY") {
        throw error;
      }
    }
  }
};

const ensureReportColumns = async () => {
  const [tables] = await sequelize.query("SHOW TABLES LIKE 'Reports'");
  if (tables.length === 0) return;

  const [columns] = await sequelize.query("SHOW COLUMNS FROM `Reports`");
  const existing = new Set(
    columns.map((column) => column.Field || column.COLUMN_NAME || column.column_name)
  );
  const additions = {
    description: "TEXT NULL",
    category: "VARCHAR(255) NULL",
    preparedBy: "VARCHAR(255) NULL",
    period: "VARCHAR(255) NULL",
    type: "VARCHAR(255) NULL",
    status: "VARCHAR(255) NULL",
    startDate: "DATE NULL",
    endDate: "DATE NULL",
    fileName: "VARCHAR(255) NULL",
    fileType: "VARCHAR(255) NULL",
    projectName: "VARCHAR(255) NULL",
    projectCode: "VARCHAR(255) NULL",
    projectId: "CHAR(36) NULL",
    templateId: "INT NULL",
    portfolioName: "VARCHAR(255) NULL",
    ownerName: "VARCHAR(255) NULL",
    ownerTitle: "VARCHAR(255) NULL",
    reportDate: "DATE NULL",
    programStatus: "VARCHAR(255) NULL",
    percentCompleted: "INT NULL",
    projectLead: "VARCHAR(255) NULL",
    projectPriority: "VARCHAR(50) NULL",
    projectStatus: "VARCHAR(50) NULL",
    overallProjectStatus: "VARCHAR(50) NULL",
    progress: "INT NULL",
    budgetPlanned: "DECIMAL(14,2) NULL",
    budgetActual: "DECIMAL(14,2) NULL",
    budgetVariance: "DECIMAL(14,2) NULL",
    milestones: "TEXT NULL",
    criticalRisks: "TEXT NULL",
    tasks: "TEXT NULL",
    pendingItems: "TEXT NULL",
    summary: "TEXT NULL",
    additionalNotes: "TEXT NULL",
  };

  for (const [name, definition] of Object.entries(additions)) {
    if (!existing.has(name)) {
      await sequelize.query(`ALTER TABLE \`Reports\` ADD COLUMN \`${name}\` ${definition}`);
    }
  }
};

const ensureTemplateColumns = async () => {
  const [tables] = await sequelize.query("SHOW TABLES LIKE 'Templates'");
  if (tables.length === 0) return;

  const [columns] = await sequelize.query("SHOW COLUMNS FROM `Templates`");
  const existing = new Set(
    columns.map((column) => column.Field || column.COLUMN_NAME || column.column_name)
  );

  for (const [name, definition] of Object.entries({
    projectName: "VARCHAR(255) NULL",
    projectCode: "VARCHAR(255) NULL",
    customField1Label: "VARCHAR(255) NULL",
    customField2Label: "VARCHAR(255) NULL",
  })) {
    if (!existing.has(name)) {
      await sequelize.query(`ALTER TABLE \`Templates\` ADD COLUMN \`${name}\` ${definition}`);
    }
  }
};

const ensureProjectColumns = async () => {
  const [tables] = await sequelize.query("SHOW TABLES LIKE 'Projects'");
  if (tables.length === 0) return;

  const [columns] = await sequelize.query("SHOW COLUMNS FROM `Projects`");
  const existing = new Set(
    columns.map((column) => column.Field || column.COLUMN_NAME || column.column_name)
  );

  for (const [name, definition] of Object.entries({
    startDate: "DATE NULL",
    endDate: "DATE NULL",
  })) {
    if (!existing.has(name)) {
      await sequelize.query(`ALTER TABLE \`Projects\` ADD COLUMN \`${name}\` ${definition}`);
    }
  }

  const [nulls] = await sequelize.query(
    "SELECT id, createdAt, targetDate FROM `Projects` WHERE startDate IS NULL OR endDate IS NULL"
  );
  for (const row of nulls) {
    const start = row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : null;
    const end = row.targetDate ? new Date(row.targetDate).toISOString().slice(0, 10) : null;
    if (start || end) {
      await sequelize.query(
        "UPDATE `Projects` SET startDate = COALESCE(?, startDate), endDate = COALESCE(?, endDate) WHERE id = ?",
        { replacements: [start, end, row.id] }
      );
    }
  }
};

const initDB = async () => {
  try {
    // Make sure the database exists before letting Sequelize connect
    await ensureDatabaseExists();

    await sequelize.authenticate();
    console.log("✅ Database connection established");

    try {
      await repairRoleIdColumn();
      await removeDuplicateUserEmailIndexes();
      await sequelize.sync();
      await ensureReportColumns();
      await ensureTemplateColumns();
      await ensureProjectColumns();
      console.log("✅ All models synced successfully");
    } catch (syncErr) {
      throw syncErr;
    }
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export default initDB;