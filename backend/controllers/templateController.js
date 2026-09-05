import * as service from "../services/templateService.js";
import { createAuditLog } from "../services/auditLogService.js";

export const createTemplate = async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title || !body.templateCode) {
      return res.status(400).json({ success: false, message: "Title and Template Code are required." });
    }
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions to create templates' });
    }
    const data = await service.createTemplateService({
      ...body,
      fileName: req.file?.originalname,
    });
    await createAuditLog({
      action: "TEMPLATE_CREATED",
      entityType: "Template",
      entityId: String(data.id),
      userId: String(req.user?.id || 1),
      userName: req.user?.name || req.user?.email || "Unknown",
      userRole: req.user?.role?.code || req.user?.role?.name || req.user?.role || "UNKNOWN",
      details: `Template created: ${body.title}`,
    });
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
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }
    const body = req.body || {};
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions to update templates' });
    }
    const data = await service.updateTemplateService(req.params.id, {
      ...body,
      fileName: req.file?.originalname,
    });
    await createAuditLog({
      action: "TEMPLATE_UPDATED",
      entityType: "Template",
      entityId: String(req.params.id),
      userId: String(req.user?.id || 1),
      userName: req.user?.name || req.user?.email || "Unknown",
      userRole: req.user?.role?.code || req.user?.role?.name || req.user?.role || "UNKNOWN",
      details: `Template updated: ${body.title || req.params.id}`,
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }
    const roleCode = req.user && (req.user.role?.code || req.user.role || req.user.role?.name);
    if (String(roleCode).toUpperCase() === 'TEAM_MEMBER') {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions to delete templates' });
    }
    await service.deleteTemplateService(req.params.id);
    await createAuditLog({
      action: "TEMPLATE_DELETED",
      entityType: "Template",
      entityId: String(req.params.id),
      userId: String(req.user?.id || 1),
      userName: req.user?.name || req.user?.email || "Unknown",
      userRole: req.user?.role?.code || req.user?.role?.name || req.user?.role || "UNKNOWN",
      details: `Template deleted: ${req.params.id}`,
    });
    res.json({ success: true, message: "Template deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};