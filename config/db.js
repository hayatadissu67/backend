import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  "project_db",   // Your Database Name
  "root",         // Your Database Username
  "",             // Your Database Password (leave empty if none)
  {
    host: "localhost",
    dialect: "mysql",
    logging: false,
  }
);