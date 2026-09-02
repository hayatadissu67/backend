import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const ChangeRequest = sequelize.define(
  "ChangeRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    impactAnalysis: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Cost, timeline, resource, or technical impact",
    },

    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      allowNull: false,
      defaultValue: "Pending",
    },

    requestedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    projectId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "change_requests",
    timestamps: true,
  }
);