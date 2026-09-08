import Project from "../../models/projectModel/projectModel.js";
import { Op } from "sequelize";

export const createProjectService = async (data) => {
  return await Project.create(data);
};

export const getAllProjectsService = async (user) => {
  let whereClause = {};

  if (user) {
    const roleCode = String(user.role || "").toUpperCase();

    if (roleCode === "TEAM_MEMBER") {
      const assigned = user.assignedProjectCodes || [];
      if (assigned.length > 0) {
        whereClause = { code: { [Op.in]: assigned } };
      } else {
        whereClause = { id: null };
      }
    } else if (roleCode === "PROJECT_MANAGER") {
      whereClause = {
        [Op.or]: [
          { owner: user.email },
          { owner: user.name },
        ],
      };
    }
  }

  return await Project.findAll({
    where: whereClause,
    order: [["createdAt", "DESC"]],
  });
};

export const getProjectByIdService = async (id) => {
  return await Project.findByPk(id);
};

export const updateProjectService = async (id, data) => {
  const project = await Project.findByPk(id);
  if (!project) return null;
  return await project.update(data);
};

export const deleteProjectService = async (id) => {
  const project = await Project.findByPk(id);
  if (!project) return null;
  await project.destroy();
  return project;
};
