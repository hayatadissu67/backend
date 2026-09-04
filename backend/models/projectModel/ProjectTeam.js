import { DataTypes } from 'sequelize';
import { sequelize } from "../../config/db.js";

const ProjectTeam = sequelize.define('ProjectTeam', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  projectCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  responsibility: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'project_team',
});

export default ProjectTeam;
