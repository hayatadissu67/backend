import * as service from "../services/templateService.js";

export const createTemplate = async (req, res) => {
  try {
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions to create templates' });
    }
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
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions to update templates' });
    }
    const data = await service.updateTemplateService(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions to delete templates' });
    }
    await service.deleteTemplateService(req.params.id);
    res.json({ success: true, message: "Template deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};