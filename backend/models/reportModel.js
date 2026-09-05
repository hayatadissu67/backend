import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Report = sequelize.define("Report", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  projectId: { type: DataTypes.UUID, allowNull: true },
  projectName: { type: DataTypes.STRING, allowNull: true },
  projectCode: { type: DataTypes.STRING, allowNull: true },
  templateId: { type: DataTypes.INTEGER, allowNull: true },
  portfolioName: { type: DataTypes.STRING, allowNull: true },
  ownerName: { type: DataTypes.STRING, allowNull: true },
  ownerTitle: { type: DataTypes.STRING, allowNull: true },
  reportDate: { type: DataTypes.DATEONLY, allowNull: true },
  programStatus: { type: DataTypes.STRING, allowNull: true },
  percentCompleted: { type: DataTypes.INTEGER, allowNull: true },
  projectLead: { type: DataTypes.STRING, allowNull: true },
  projectPriority: { type: DataTypes.STRING, allowNull: true },
  projectStatus: { type: DataTypes.STRING, allowNull: true },
  overallProjectStatus: { type: DataTypes.STRING, allowNull: true },
  progress: { type: DataTypes.INTEGER, allowNull: true },
  budgetPlanned: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
  budgetActual: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
  budgetVariance: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
  milestones: { type: DataTypes.TEXT, allowNull: true },
  criticalRisks: { type: DataTypes.TEXT, allowNull: true },
  tasks: { type: DataTypes.TEXT, allowNull: true },
  pendingItems: { type: DataTypes.TEXT, allowNull: true },
  summary: { type: DataTypes.TEXT, allowNull: true },
  additionalNotes: { type: DataTypes.TEXT, allowNull: true },
  format: {
    type: DataTypes.ENUM("PDF", "Excel"),
    allowNull: false,
    defaultValue: "Excel",
  },
  description: { type: DataTypes.TEXT, allowNull: true },
  category: { type: DataTypes.STRING, allowNull: true },
  preparedBy: { type: DataTypes.STRING, allowNull: true },
  period: { type: DataTypes.STRING, allowNull: true },
  type: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: true, defaultValue: "Published" },
  startDate: { type: DataTypes.DATEONLY, allowNull: true },
  endDate: { type: DataTypes.DATEONLY, allowNull: true },
  fileName: { type: DataTypes.STRING, allowNull: true },
  fileType: { type: DataTypes.STRING, allowNull: true },
  fileSize: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, { timestamps: true });

export default Report;