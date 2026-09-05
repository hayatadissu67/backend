import ExecutiveRequest from "../models/executiveRequestModel.js";

export class ExecutiveRequestService {
  async getAllRequests() {
    return await ExecutiveRequest.findAll({ order: [["createdAt", "DESC"]] });
  }

  async getRequestById(id) {
    const request = await ExecutiveRequest.findByPk(id);
    if (!request) {
      throw new Error("Executive request not found");
    }
    return request;
  }

  async createRequest(data) {
    if (!data.templateId) {
      throw new Error("Template ID is required");
    }
    if (!data.templateTitle) {
      throw new Error("Template title is required");
    }
    if (!data.requestedBy) {
      throw new Error("Requester name is required");
    }
    if (!data.requestedByRole) {
      throw new Error("Requester role is required");
    }
    if (!data.approverRole) {
      throw new Error("Approver role is required");
    }
    return await ExecutiveRequest.create({
      ...data,
      fieldValues: data.fieldValues ? JSON.stringify(data.fieldValues) : null,
    });
  }

  async approveRequest(id, approverName, signature) {
    const request = await ExecutiveRequest.findByPk(id);
    if (!request) {
      throw new Error("Executive request not found");
    }
    if (request.status !== "Pending") {
      throw new Error(`Request is already ${request.status}`);
    }
    await request.update({
      status: "Approved",
      approverName,
      executiveSignature: signature,
      decisionDate: new Date(),
    });
    return request;
  }

  async rejectRequest(id, approverName, rejectionReason) {
    const request = await ExecutiveRequest.findByPk(id);
    if (!request) {
      throw new Error("Executive request not found");
    }
    if (request.status !== "Pending") {
      throw new Error(`Request is already ${request.status}`);
    }
    if (!rejectionReason) {
      throw new Error("Rejection reason is required");
    }
    await request.update({
      status: "Rejected",
      approverName,
      rejectionReason,
      decisionDate: new Date(),
    });
    return request;
  }

  async getPendingRequests() {
    return await ExecutiveRequest.findAll({ where: { status: "Pending" }, order: [["createdAt", "DESC"]] });
  }

  async getAuditLog() {
    return await ExecutiveRequest.findAll({ where: { status: ["Approved", "Rejected"] }, order: [["decisionDate", "DESC"]] });
  }
}
