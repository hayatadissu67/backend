import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  "project_db",   // Your Database Name
  "root",         // Your Database Username
  "",             // Your Database Password (leave empty if none)
  {
<<<<<<< HEAD
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
=======
    host: "localhost",
>>>>>>> ad6e8334b72d0cccc5d08b78a939db8c3c668301
    dialect: "mysql",
    logging: false,
  }
);