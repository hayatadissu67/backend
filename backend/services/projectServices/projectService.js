import Project from "../../models/projectModel/projectModel.js";

export const createProjectService = async (data) => {
  return await Project.create(data);
};

export const getAllProjectsService = async (user) => {
  let whereClause = {};
  if (user) {
    if (user.role === 'TEAM_MEMBER') {
      const ProjectTeam = (await import('../../models/projectModel/ProjectTeam.js')).default;
      const assignments = await ProjectTeam.findAll({ where: { userId: user.id } });
      const projectCodes = assignments.map(a => a.projectCode);
      const { Op } = await import('sequelize');
      whereClause = { code: { [Op.in]: projectCodes } };
    } else if (user.role === 'PROJECT_MANAGER') {
      const ProjectTeam = (await import('../../models/projectModel/ProjectTeam.js')).default;
      const assignments = await ProjectTeam.findAll({ where: { userId: user.id } });
      const projectCodes = assignments.map(a => a.projectCode);
      const { Op } = await import('sequelize');
      whereClause = {
        [Op.or]: [
          { owner: user.email },
          { code: { [Op.in]: projectCodes } }
        ]
      };
    }
  }
  return await Project.findAll({
    where: whereClause,
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
