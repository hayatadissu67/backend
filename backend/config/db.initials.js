import { sequelize } from "./db.js";

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

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    await sequelize.sync({ alter: true });

    console.log("✅ All models synced successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export default initDB;