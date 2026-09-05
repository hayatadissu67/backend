import { DataTypes } from 'sequelize';
import { sequelize } from "../config/db.js";

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  department: { type: DataTypes.STRING, allowNull: false },
  owner: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'DELAYED', 'PLANNING'), defaultValue: 'PLANNING' },
  health: { type: DataTypes.ENUM('GREEN', 'YELLOW', 'RED'), defaultValue: 'GREEN' },
  budget: { type: DataTypes.FLOAT, defaultValue: 0 },
  spent: { type: DataTypes.FLOAT, defaultValue: 0 },
  progress: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  gate: { type: DataTypes.STRING },
  targetDate: { type: DataTypes.DATEONLY },
  description: { type: DataTypes.TEXT },
  priority: { type: DataTypes.ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'), defaultValue: 'MEDIUM' },
  lifecycleStage: { type: DataTypes.STRING },
  approvalStatus: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), defaultValue: 'PENDING' },
  approvedBy: { type: DataTypes.STRING },
  rejectionReason: { type: DataTypes.TEXT },
  team: { type: DataTypes.JSON }
}, {
  timestamps: true,
  tableName: 'projects',
});

export default Project;
