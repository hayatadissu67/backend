import Template from "../../models/templateModel/templateModel.js";

export const createTemplateRepo = async (data) => await Template.create(data);

export const getTemplatesRepo = async () => await Template.findAll();

export const updateTemplateRepo = async (id, data) => {
  const template = await Template.findByPk(id);
  if (!template) throw new Error("Template not found");
  return await template.update(data);
};

export const deleteTemplateRepo = async (id) => {
  const template = await Template.findByPk(id);
  if (!template) throw new Error("Template not found");
  return await template.destroy();
};