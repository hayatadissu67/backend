import Portfolio from "../../models/portfolioModel/portfolioModel.js";

export const createPortfolioRepo = async (data) => await Portfolio.create(data);

export const getPortfoliosRepo = async () => await Portfolio.findAll();

export const updatePortfolioRepo = async (id, data) => {
  const portfolio = await Portfolio.findByPk(id);
  if (!portfolio) throw new Error("Portfolio not found");
  return await portfolio.update(data);
};

export const deletePortfolioRepo = async (id) => {
  const portfolio = await Portfolio.findByPk(id);
  if (!portfolio) throw new Error("Portfolio not found");
  return await portfolio.destroy();
};