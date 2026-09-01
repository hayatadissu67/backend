import * as repo from "../../repository/portfolioRepository/portfolioRepository.js";

export const createPortfolioService = async (data) => {
  if (!data.name || !data.code) {
    throw new Error("Name and Code are required.");
  }
  return await repo.createPortfolioRepo(data);
};

export const getPortfoliosService = async () => await repo.getPortfoliosRepo();

export const updatePortfolioService = async (id, data) => await repo.updatePortfolioRepo(id, data);

export const deletePortfolioService = async (id) => await repo.deletePortfolioRepo(id);