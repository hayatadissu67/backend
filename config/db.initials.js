import {sequelize} from "./db.js";

import "../models/reportModel/reportModel.js";
import "../models/templateModel/templateModel.js";
import "../models/portfolioModel/portfolioModel.js";


const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    await sequelize.sync({ alter: true }); // use { force: true } for dev reset
    console.log("✅ All models synced successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export default initDB;
