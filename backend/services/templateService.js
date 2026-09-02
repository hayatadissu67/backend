import * as repo from "../repository/templateRepository.js";

export const createTemplateService = async (data) => {
  if (!data.title || !data.templateCode) {
    throw new Error("Title and Template Code are required.");
  }
  return await repo.createTemplateRepo(data);
};

export const getTemplatesService = async () => await repo.getTemplatesRepo();

export const updateTemplateService = async (id, data) => await repo.updateTemplateRepo(id, data);

export const deleteTemplateService = async (id) => await repo.deleteTemplateRepo(id);