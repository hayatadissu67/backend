import User from "./userModel.js";
import Role from "./roleModel.js";
import Project from "./projectModel.js";
import { Resource } from "./Resource.js";

Role.hasMany(User, {
  foreignKey: "roleId",
  as: "users",
});

User.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
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