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

    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "projects", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    type: {
      type: DataTypes.ENUM("ALLOCATION", "ASSIGNMENT_REQUEST"),
      allowNull: false,
      defaultValue: "ALLOCATION",
    },

    employeeName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    projectTarget: {
      type: DataTypes.STRING,
      allowNull: true,
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

    approvalComment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    rejectionComment: {
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