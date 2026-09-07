import { sequelize } from "./db.js";
import "../models/budgetModel.js";
import "../models/changeRequestModel.js";


import "../models/taskModel.js";
import "../models/notificationModel.js";
import Risk from "../models/riskModel.js";
import User from "../models/userModel.js";
import ProjectTeam from "../models/projectModel/ProjectTeam.js";
import Project from "../models/projectModel/projectModel.js";

const initDB = async () => {
  try {
    // Define Associations
    Risk.belongsTo(User, { foreignKey: 'resolvedBy', as: 'Resolver' });
    
    // Project Team Associations (Optional, but good for completeness)
    User.belongsToMany(Project, { through: ProjectTeam, foreignKey: 'userId', otherKey: 'projectCode', sourceKey: 'id', targetKey: 'code' });
    Project.belongsToMany(User, { through: ProjectTeam, foreignKey: 'projectCode', otherKey: 'userId', sourceKey: 'code', targetKey: 'id' });

    await sequelize.authenticate();
    console.log("✅ Database connection established");

    await sequelize.sync({ alter: true });

    console.log("✅ All models synced successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export default initDB;
