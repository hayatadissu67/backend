import User from "./userModel.js";
import Role from "./roleModel.js";
import Project from "./projectModel.js";
import Room from "./roomModel.js";
import Message from "./messageModel.js";
import Reaction from "./reactionModel.js";
import { Resource } from "./Resource.js";

Role.hasMany(User, {
  foreignKey: "roleId",
  as: "users",
});

User.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

User.hasMany(Room, {
  foreignKey: "createdBy",
  as: "createdRooms",
});

Room.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

Project.hasMany(Room, {
  foreignKey: "projectId",
  as: "rooms",
});

Room.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});

Room.hasMany(Message, {
  foreignKey: "roomId",
  as: "messages",
});

Message.belongsTo(Room, {
  foreignKey: "roomId",
  as: "room",
});

User.hasMany(Message, {
  foreignKey: "senderId",
  as: "messages",
});

Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});

Message.hasMany(Reaction, {
  foreignKey: "messageId",
  as: "reactions",
});

Reaction.belongsTo(Message, {
  foreignKey: "messageId",
  as: "message",
});

User.hasMany(Reaction, {
  foreignKey: "userId",
  as: "reactions",
});

Reaction.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Project.hasMany(Resource, {
  foreignKey: "projectId",
  as: "resources",
});

Resource.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});

User.hasMany(Resource, {
  foreignKey: "userId",
  as: "resources",
});

Resource.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});