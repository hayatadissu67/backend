import ExecutiveRequest from "../models/executiveRequestModel.js";
import { createAuditLog } from "../services/auditLogService.js";

const parseFieldValues = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return {}; }
};

const serializeRequest = (r) => {
  const obj = typeof r.toJSON === 'function' ? r.toJSON() : { ...r };
  return { ...obj, fieldValues: parseFieldValues(obj.fieldValues) };
};

export const getAllExecutiveRequests = async (req, res) => {
  try {
    const requests = await ExecutiveRequest.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ success: true, data: requests.map(serializeRequest) });
  } catch (error) {
    console.error("Get Executive Requests Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch executive requests", error: error.message });
  }
};

export const getPendingExecutiveRequests = async (req, res) => {
  try {
    const requests = await ExecutiveRequest.findAll({ where: { status: "Pending" }, order: [["createdAt", "DESC"]] });
    res.json({ success: true, data: requests.map(serializeRequest) });
  } catch (error) {
    console.error("Get Pending Executive Requests Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pending executive requests", error: error.message });
  }
};

export const getExecutiveAuditLog = async (req, res) => {
  try {
    const requests = await ExecutiveRequest.findAll({ where: { status: ["Approved", "Rejected"] }, order: [["decisionDate", "DESC"]] });
    res.json({ success: true, data: requests.map(serializeRequest) });
  } catch (error) {
    console.error("Get Executive Audit Log Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch executive audit log", error: error.message });
  }
};

export const createExecutiveRequest = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const userName = req.user?.name || req.user?.email || "Unknown User";
    const userRole = req.user?.role?.code || req.user?.role?.name || req.user?.role || "TEAM_MEMBER";

    const { templateId, templateTitle, category, projectId, projectCode, projectName, approverRole, fieldValues, executiveSignature } = req.body;

    if (!templateId || !templateTitle || !approverRole) {
      return res.status(400).json({ success: false, message: "Template ID, title, and approver role are required" });
    }

    const request = await ExecutiveRequest.create({
      templateId: String(templateId),
      templateTitle,
      category: category || "Executive Charter",
      projectId: projectId ? String(projectId) : null,
      projectCode: projectCode || null,
      projectName: projectName || null,
      requestedBy: userName,
      requestedByRole: userRole,
      requestedById: userId,
      approverRole,
      executiveSignature: executiveSignature || null,
      fieldValues: fieldValues ? JSON.stringify(fieldValues) : null,
      status: "Pending",
    });

    await createAuditLog({
      action: "EXECUTIVE_REQUEST_CREATED",
      entityType: "ExecutiveRequest",
      entityId: String(request.id),
      userId: String(userId),
      userName,
      userRole,
      details: `Executive template request created for template ${templateTitle}`,
    });

    res.status(201).json({ success: true, data: serializeRequest(request) });
  } catch (error) {
    console.error("Create Executive Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to create executive request", error: error.message });
  }
};

export const approveExecutiveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { executiveSignature } = req.body || {};
    const approverName = req.user?.name || req.user?.email || "Executive";
    const userId = req.user?.id || 1;
    const userRole = req.user?.role?.code || req.user?.role?.name || req.user?.role || "EXECUTIVE_MANAGER";

    const request = await ExecutiveRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Executive request not found" });
    }
    if (request.status !== "Pending") {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    await request.update({
      status: "Approved",
      approverName,
      approverRole: userRole,
      executiveSignature: executiveSignature || approverName,
      decisionDate: new Date(),
    });

    await createAuditLog({
      action: "EXECUTIVE_REQUEST_APPROVED",
      entityType: "ExecutiveRequest",
      entityId: String(request.id),
      userId: String(userId),
      userName: approverName,
      userRole,
      details: `Executive template request approved for template ${request.templateTitle}`,
    });

    res.json({ success: true, data: serializeRequest(request) });
  } catch (error) {
    console.error("Approve Executive Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to approve executive request", error: error.message });
  }
};

export const rejectExecutiveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const approverName = req.user?.name || req.user?.email || "Executive";
    const userId = req.user?.id || 1;
    const userRole = req.user?.role?.code || req.user?.role?.name || req.user?.role || "EXECUTIVE_MANAGER";

    const request = await ExecutiveRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Executive request not found" });
    }
    if (request.status !== "Pending") {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }

    await request.update({
      status: "Rejected",
      approverName,
      approverRole: userRole,
      rejectionReason,
      decisionDate: new Date(),
    });

    await createAuditLog({
      action: "EXECUTIVE_REQUEST_REJECTED",
      entityType: "ExecutiveRequest",
      entityId: String(request.id),
      userId: String(userId),
      userName: approverName,
      userRole,
      details: `Executive template request rejected for template ${request.templateTitle}. Reason: ${rejectionReason}`,
    });

    res.json({ success: true, data: serializeRequest(request) });
  } catch (error) {
    console.error("Reject Executive Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to reject executive request", error: error.message });
  }
};
