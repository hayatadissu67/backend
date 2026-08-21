import * as service from "../../services/templateService/templateService.js";

export const createTemplate = async (req, res) => {
  try {
    const data = await service.createTemplateService(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const data = await service.getTemplatesService();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const data = await service.updateTemplateService(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    await service.deleteTemplateService(req.params.id);
    res.json({ success: true, message: "Template deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};