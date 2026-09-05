import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ExecutiveRequest = sequelize.define("ExecutiveRequest", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  templateId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  templateTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  projectCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  projectName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  requestedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  requestedByRole: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  requestedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  requestedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
    allowNull: false,
    defaultValue: "Pending",
  },
  approverRole: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  approverName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  decisionDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  executiveSignature: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fieldValues: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "executive_requests",
  timestamps: true,
});

export default ExecutiveRequest;
