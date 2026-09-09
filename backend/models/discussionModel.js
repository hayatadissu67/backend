import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Discussion = sequelize.define(
  "Discussion",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    repliesCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    projectTag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "discussions",
    timestamps: true,
  }
);

export default Discussion;
