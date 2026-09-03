import { DataTypes } from 'sequelize';
import { sequelize } from "../../config/db.js";

const Risk = sequelize.define('Risk', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ref: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  severity: { type: DataTypes.ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'), defaultValue: 'MEDIUM' },
  owner: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.ENUM('Risk', 'Issue'), defaultValue: 'Risk' },
  projectRef: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('OPEN', 'REPORTED', 'ESCALATED', 'IN_REVIEW', 'MITIGATED', 'RESOLVED'), defaultValue: 'OPEN' },
  assignedRiskManager: { type: DataTypes.STRING },
  flaggedBy: { type: DataTypes.STRING },
  submittedBy: { type: DataTypes.STRING },
  milestoneRef: { type: DataTypes.STRING },
  delegationNotes: { type: DataTypes.TEXT },
  escalationNotes: { type: DataTypes.TEXT },
  resolutionNotes: { type: DataTypes.TEXT },
  resolvedBy: { type: DataTypes.INTEGER },
  resolvedByRole: { type: DataTypes.STRING },
  delegatedAt: { type: DataTypes.DATE },
  escalatedAt: { type: DataTypes.DATE },
  resolvedAt: { type: DataTypes.DATE }
}, {
  timestamps: true,
  tableName: 'risks',
});

export default Risk;
