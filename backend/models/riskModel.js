import { DataTypes } from 'sequelize';
import { sequelize } from "../config/db.js";

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
  status: { type: DataTypes.STRING, defaultValue: 'OPEN' }
}, {
  timestamps: true,
  tableName: 'risks',
});

export default Risk;
