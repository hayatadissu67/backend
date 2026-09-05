import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import Role from "../models/roleModel.js";
import User from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";

const rolesData = [
  {
    id: uuidv4(),
    code: "EXECUTIVE_MANAGER",
    name: "Executive Manager",
    description: "Has access to the Executive Dashboard and high-level reports.",
  },
  {
    id: uuidv4(),
    code: "PROJECT_MANAGER",
    name: "Project Manager",
    description: "Has access to Project Management tools and Dashboard.",
  },
  {
    id: uuidv4(),
    code: "RISK_MANAGER",
    name: "Risk Manager",
    description: "Has access to Risk Management tools and Dashboard.",
  },
  {
    id: uuidv4(),
    code: "TEAM_MEMBER",
    name: "Team Member",
    description: "Has access to Team Member tasks and Dashboard.",
  },
];

const seedRoles = async () => {
  try {
    const { sequelize } = await import("../config/db.js");
    console.log("Connecting to the database...");
    await sequelize.authenticate();
    
    // Create roles if they don't exist
    for (const roleData of rolesData) {
      const [role, created] = await Role.findOrCreate({
        where: { code: roleData.code },
        defaults: roleData,
      });
      if (created) {
        console.log(`Created role: ${role.code}`);
      } else {
        console.log(`Role already exists: ${role.code}`);
      }
    }

    const allRoles = await Role.findAll();
    const roleMap = {};
    for (const role of allRoles) {
      roleMap[role.code] = role.id;
    }

    // Map existing users based on email
    const users = await User.findAll();
    for (const user of users) {
      let roleCode = "TEAM_MEMBER"; // default
      if (user.email === "executive@pmo.com") {
        roleCode = "EXECUTIVE_MANAGER";
      } else if (user.email === "pm@pmo.com") {
        roleCode = "PROJECT_MANAGER";
      } else if (user.email === "risk@pmo.com") {
        roleCode = "RISK_MANAGER";
      } else if (user.email === "team@pmo.com") {
        roleCode = "TEAM_MEMBER";
      }

      if (user.roleId !== roleMap[roleCode]) {
        user.roleId = roleMap[roleCode];
        await user.save();
        console.log(`Updated user ${user.email} to role ${roleCode}`);
      }
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedRoles();
