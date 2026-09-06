import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Reaction = sequelize.define(
  "Reaction",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "messages",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    emoji: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
  },
  {
    tableName: "reactions",
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["messageId", "userId", "emoji"],
      },
    ],
  }
);

export default Reaction;