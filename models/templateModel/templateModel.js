import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

const Template = sequelize.define("Template", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  templateCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  version: {
    type: DataTypes.STRING,
    defaultValue: "v1.0",
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  requiredSignOff: {
    type: DataTypes.STRING,
    defaultValue: "Executive Sponsor",
  },
  requiredFields: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, { timestamps: true });

export default Template;