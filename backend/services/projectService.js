import Project from "../models/projectModel.js";

export const createProjectService = async (data) => {
  return await Project.create(data);
};

export const getAllProjectsService = async () => {
  return await Project.findAll({
    order: [['createdAt', 'DESC']]
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
