import { sequelize } from "./db.js";
import "../models/budgetModel/budgetModel.js";
import "../models/ChangeRequestModel/changeRequestModel.js";

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