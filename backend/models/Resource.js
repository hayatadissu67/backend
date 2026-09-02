import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Resource = sequelize.define(
  "Resource",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    type: {
      type: DataTypes.ENUM("ALLOCATION", "ASSIGNMENT_REQUEST"),
      allowNull: false,
      defaultValue: "ALLOCATION",
    },

    employeeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    projectTarget: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    assignedTask: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    hoursPerWeek: {
      type: DataTypes.INTEGER,
      defaultValue: 40,
    },

    pmRequesterName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    requestedWorkEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    projectRoleTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    businessJustification: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "PENDING",
        "APPROVED",
        "REJECTED"
      ),
      defaultValue: "ACTIVE",
    },
  },
  {
    timestamps: true,
    tableName: "resources",
  }
);

export { Resource };