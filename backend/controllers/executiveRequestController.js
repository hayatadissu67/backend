import ExecutiveRequest from "../models/executiveRequestModel.js";
import { createAuditLog } from "../services/auditLogService.js";

export const getAllExecutiveRequests = async (req, res) => {
  try {
    const requests = await ExecutiveRequest.findAll({ order: [["createdAt", "DESC"]] });
    const parsed = requests.map((r) => ({
      ...r.toJSON(),
      fieldValues: r.fieldValues ? JSON.parse(r.fieldValues) : {},
    }));
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Get Executive Requests Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch executive requests", error: error.message });
  }
};

export const getPendingExecutiveRequests = async (req, res) => {
  try {
    const requests = await ExecutiveRequest.findAll({ where: { status: "Pending" }, order: [["createdAt", "DESC"]] });
    const parsed = requests.map((r) => ({
      ...r.toJSON(),
      fieldValues: r.fieldValues ? JSON.parse(r.fieldValues) : {},
    }));
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Get Pending Executive Requests Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pending executive requests", error: error.message });
  }
};

export const getExecutiveAuditLog = async (req, res) => {
  try {
    const requests = await ExecutiveRequest.findAll({ where: { status: ["Approved", "Rejected"] }, order: [["decisionDate", "DESC"]] });
    const parsed = requests.map((r) => ({
      ...r.toJSON(),
      fieldValues: r.fieldValues ? JSON.parse(r.fieldValues) : {},
    }));
    res.json({ success: true, data: parsed });
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

    const { templateId, templateTitle, category, projectId, projectCode, projectName, approverRole, fieldValues } = req.body;

    if (!templateId || !templateTitle || !approverRole) {
      return res.status(400).json({ success: false, message: "Template ID, title, and approver role are required" });
    }

    const request = await ExecutiveRequest.create({
      templateId,
      templateTitle,
      category: category || "Executive Charter",
      projectId,
      projectCode,
      projectName,
      requestedBy: userName,
      requestedByRole: userRole,
      requestedById: userId,
      approverRole,
      fieldValues: fieldValues || {},
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

    const parsed = { ...request.toJSON(), fieldValues: request.fieldValues ? JSON.parse(request.fieldValues) : {} };
    res.status(201).json({ success: true, data: parsed });
  } catch (error) {
    console.error("Create Executive Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to create executive request", error: error.message });
  }
};

export const approveExecutiveRequest = async (req, res) => {
  try {
    const { id } = req.params;
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

    const parsed = { ...request.toJSON(), fieldValues: request.fieldValues ? JSON.parse(request.fieldValues) : {} };
    res.json({ success: true, data: parsed });
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

    const parsed = { ...request.toJSON(), fieldValues: request.fieldValues ? JSON.parse(request.fieldValues) : {} };
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Reject Executive Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to reject executive request", error: error.message });
  }
};
