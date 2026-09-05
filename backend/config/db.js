import { Sequelize } from "sequelize";

export const dbConfig = {
  database: process.env.DB_NAME || "pmo",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD ?? "",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
};

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: "mysql",
    logging: false,
  }
);