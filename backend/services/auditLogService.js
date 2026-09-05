import AuditLog from "../models/auditLogModel.js";

export class AuditLogService {
  async createLog(data) {
    return await AuditLog.create(data);
  }

  async getAllLogs() {
    return await AuditLog.findAll({ order: [["createdAt", "DESC"]] });
  }

  async getLogsByEntity(entityType, entityId) {
    return await AuditLog.findAll({ where: { entityType, entityId }, order: [["createdAt", "DESC"]] });
  }

  async getLogsByUser(userId) {
    return await AuditLog.findAll({ where: { userId }, order: [["createdAt", "DESC"]] });
  }
}

export const createAuditLog = async (data) => {
  const service = new AuditLogService();
  return await service.createLog({
    ...data,
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
  });
};
