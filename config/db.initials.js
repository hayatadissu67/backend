<<<<<<< HEAD
import {sequelize} from "./db.js";

import "../models/reportModel/reportModel.js";
import "../models/templateModel/templateModel.js";
import "../models/portfolioModel/portfolioModel.js";

=======
import { sequelize } from "./db.js";
import "../models/budgetModel/budgetModel.js";
import "../models/ChangeRequestModel/changeRequestModel.js";
>>>>>>> ad6e8334b72d0cccc5d08b78a939db8c3c668301

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