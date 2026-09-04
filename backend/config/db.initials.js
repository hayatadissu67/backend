import { sequelize } from "./db.js";
import "../models/budgetModel/budgetModel.js";
import "../models/ChangeRequestModel/changeRequestModel.js";
import "../models/projectModel/projectModel.js";
import "../models/riskModel/riskModel.js";
import "../models/taskModel/taskModel.js";
import "../models/notificationModel.js";
import Risk from "../models/riskModel/riskModel.js";
import User from "../models/authModel/userModel.js";
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