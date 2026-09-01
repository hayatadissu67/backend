import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME || "project_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "jesus123",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false,
  }
);
