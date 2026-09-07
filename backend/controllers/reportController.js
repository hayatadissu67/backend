import * as service from "../services/reportService.js";
import { createAuditLog } from "../services/auditLogService.js";

const structuredFields = ['milestones', 'criticalRisks', 'tasks', 'pendingItems'];
const normalizeReportPayload = (payload) => {
  const normalized = { ...payload };
  for (const field of structuredFields) {
    if (normalized[field] && typeof normalized[field] !== 'string') {
      normalized[field] = JSON.stringify(normalized[field]);
    }
  }
  return normalized;
};

export const getReports = async (req, res) => {
  try {
    const data = await service.getReportsService();
    // All authorized roles can view all reports. Filtering by user identity
    // is intentionally not applied so that reports persist across role views.
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReportById = async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid report ID' });
  }

  try {
    const data = await service.getReportByIdService(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const data = await service.createReportService(normalizeReportPayload({
      ...req.body,
      format: req.body.format || (req.file?.mimetype?.includes("pdf") ? "PDF" : "Excel"),
      fileName: req.file?.originalname,
      fileType: req.file?.mimetype,
      fileSize: req.file ? String(req.file.size) : undefined,
    }));
    await createAuditLog({
      action: "REPORT_CREATED",
      entityType: "Report",
      entityId: String(data.id),
      userId: String(req.user?.id || 1),
      userName: req.user?.name || req.user?.email || "Unknown",
      userRole: req.user?.role?.code || req.user?.role?.name || req.user?.role || "UNKNOWN",
      details: `Report created: ${req.body.title}`,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    const msg = err.errors ? err.errors.map(e => e.message) : err.message;
    res.status(400).json({ success: false, message: msg });
  }
};

export const updateReport = async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid report ID' });
  }
  try {
    const data = await service.updateReportService(req.params.id, normalizeReportPayload({
      ...req.body,
      fileName: req.file?.originalname,
      fileType: req.file?.mimetype,
      fileSize: req.file ? String(req.file.size) : undefined,
    }));
    await createAuditLog({
      action: "REPORT_UPDATED",
      entityType: "Report",
      entityId: String(req.params.id),
      userId: String(req.user?.id || 1),
      userName: req.user?.name || req.user?.email || "Unknown",
      userRole: req.user?.role?.code || req.user?.role?.name || req.user?.role || "UNKNOWN",
      details: `Report updated: ${req.body.title || req.params.id}`,
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteReport = async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid report ID' });
  }
  try {
    await service.deleteReportService(req.params.id);
    await createAuditLog({
      action: "REPORT_DELETED",
      entityType: "Report",
      entityId: String(req.params.id),
      userId: String(req.user?.id || 1),
      userName: req.user?.name || req.user?.email || "Unknown",
      userRole: req.user?.role?.code || req.user?.role?.name || req.user?.role || "UNKNOWN",
      details: `Report deleted: ${req.params.id}`,
    });
    res.json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};