

import { DataTypes } from 'sequelize';
import {sequelie} from "../../config/db.js"

const Task = sequelize.define(
  'Task',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetProject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assignee: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      defaultValue: 'MEDIUM',
    },
    estimatedWorkHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    completionDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('TO_DO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'COMPLETED'),
      defaultValue: 'TO_DO',
    },
    progress: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0,
  validate: {
    min: 0,
    max: 100,
  },
},
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'tasks',
  }
);

export {Task};