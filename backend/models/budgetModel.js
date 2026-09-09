import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Budget = sequelize.define(
  "Budget",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    projectCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    projectName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    allocated: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },

    actualSpent: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },

    committed: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },

    variance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },

    health: {
      type: DataTypes.ENUM("On Track", "Over Budget", "Under Budget"),
      allowNull: true,
      defaultValue: "On Track",
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "budgets",
    timestamps: true,
  }
);

export default Budget;