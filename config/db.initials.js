import { sequelize } from "./db.js";

import "../models/reportModel/reportModel.js";
import "../models/templateModel/templateModel.js";
import "../models/portfolioModel/portfolioModel.js";
import "../models/budgetModel/budgetModel.js";
import "../models/ChangeRequestModel/changeRequestModel.js";
import "../models/authModel/roleModel.js";
import "../models/authModel/userModel.js";
import "../models/authModel/association.js";

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