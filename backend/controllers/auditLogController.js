import AuditLog from "../models/auditLogModel.js";

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch audit logs", error: error.message });
  }
};

export const getAuditLogsByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const logs = await AuditLog.findAll({ where: { entityType, entityId }, order: [["createdAt", "DESC"]] });
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Get Audit Logs By Entity Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch audit logs", error: error.message });
  }
};
