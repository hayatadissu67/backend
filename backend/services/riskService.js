import Risk from "../models/riskModel.js";

export const createRiskService = async (data) => {
  return await Risk.create(data);
};

export const getAllRisksService = async () => {
  return await Risk.findAll({
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
