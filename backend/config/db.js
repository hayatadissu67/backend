import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const sequelize = new Sequelize(
  process.env.DB_NAME || "pmo",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "ha123",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    connectTimeout: 10000,
    logging: false,
  }
);