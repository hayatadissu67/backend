import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Portfolio = sequelize.define("Portfolio", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "Active",
  },
});

export default Portfolio;