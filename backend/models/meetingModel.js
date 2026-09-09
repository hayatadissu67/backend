import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Meeting = sequelize.define(
  "Meeting",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attendees: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Scheduled", "Completed", "Cancelled"),
      allowNull: false,
      defaultValue: "Scheduled",
    },
    agenda: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "meetings",
    timestamps: true,
  }
);

export default Meeting;
