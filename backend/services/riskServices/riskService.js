import Risk from "../../models/riskModel/riskModel.js";
import Project from "../../models/projectModel/projectModel.js";
import { Op } from "sequelize";

import User from "../../models/authModel/userModel.js";

export const createRiskService = async (data) => {
  return await Risk.create(data);
};

export const getAllRisksService = async (user) => {
  let whereClause = {};

  if (user) {
    if (user.role === 'EXECUTIVE_MANAGER' || user.role === 'RISK_MANAGER') {
      // Can see all risks
    } else if (user.role === 'TEAM_MEMBER') {
      whereClause = { submittedBy: user.email };
    } else if (user.role === 'PROJECT_MANAGER') {
      const pmProjects = await Project.findAll({ where: { owner: user.email }, attributes: ['code'] });
      
      const ProjectTeam = (await import('../../models/projectModel/ProjectTeam.js')).default;
      const pmAssignments = await ProjectTeam.findAll({ where: { userId: user.id } });
      
      const pmProjectCodes = [
          ...pmProjects.map(p => p.code),
          ...pmAssignments.map(a => a.projectCode)
      ];

      whereClause = {
        [Op.or]: [
          { owner: user.email },
          { submittedBy: user.email },
          { projectRef: { [Op.in]: pmProjectCodes } }
        ]
      };
    }
  }

  return await Risk.findAll({
    where: whereClause,
    include: [{
      model: User,
      as: 'Resolver',
      attributes: ['name']
    }],
    order: [['createdAt', 'DESC']]
  });
};

export const getRiskByIdService = async (id) => {
  return await Risk.findByPk(id);
};

export const updateRiskService = async (id, data) => {
  const risk = await Risk.findByPk(id);
  if (!risk) return null;
  return await risk.update(data);
};

export const deleteRiskService = async (id) => {
  const risk = await Risk.findByPk(id);
  if (!risk) return null;
  await risk.destroy();
  return risk;
};
