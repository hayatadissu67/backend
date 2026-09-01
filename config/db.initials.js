import { sequelize } from "./db.js";

import "../models/reportModel/reportModel.js";
import "../models/templateModel/templateModel.js";
import "../models/portfolioModel/portfolioModel.js";
import "../models/budgetModel/budgetModel.js";
import "../models/ChangeRequestModel/changeRequestModel.js";

import "../models/authModel/roleModel.js";
import "../models/authModel/userModel.js";
import "../models/authModel/association.js";

import "../models/projectModel/projectModel.js";
import "../models/riskModel/riskModel.js";


const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    await sequelize.sync({ alter: true });

    console.log("✅ All models synced successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    console.error("💡 Hint: Check your .env DB credentials or start MySQL service.");
  }
};

export default initDB;
