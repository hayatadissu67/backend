import { DataTypes } from 'sequelize';
import { sequelize } from "../config/db.js";

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  title: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  message: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  type: { 
    type: DataTypes.ENUM('info', 'success', 'warning', 'alert'), 
    defaultValue: 'info' 
  },
  isRead: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  timestamp: {
    type: DataTypes.STRING,
    defaultValue: 'Just now'
  }
}, {
  timestamps: true,
  tableName: 'notifications',
});

export default Notification;
