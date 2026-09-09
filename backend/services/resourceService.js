import { ResourceRepository } from "../repository/resourceRepository.js"
import Project from "../models/projectModel.js";
import User from "../models/userModel.js";

const resourceRepository = new ResourceRepository();

export class ResourceService {
  async createResource(payload) {
    const { type, projectId, userId } = payload;

    if (!projectId || !userId) {
      throw new Error("projectId and userId are required");
    }

    const [project, user] = await Promise.all([
      Project.findByPk(projectId),
      User.findByPk(userId),
    ]);

    if (!project) throw new Error("Project not found");
    if (!user) throw new Error("User not found");
    if (!user.department) throw new Error("This employee does not have a department assigned.");

    const hoursPerWeek = payload.hoursPerWeek !== undefined
      ? Number(payload.hoursPerWeek)
      : 40;

    if (!Number.isFinite(hoursPerWeek) || hoursPerWeek < 0 || hoursPerWeek > 45) {
      throw new Error("Hours per week must be between 0 and 45");
    }

    if (type === "ASSIGNMENT_REQUEST") {
      const existingRequest = await ResourceRepository.findExistingAssignmentRequest(
        projectId,
        userId
      );

      if (existingRequest) {
        throw new Error("Assignment request already exists for this member and project.");
      }
    }

    if (type === "ALLOCATION") {
      const weeklyCapacity = 40;
      const allocatedHours = await ResourceRepository.getActiveAllocationHours(userId);
      const remainingHours = Math.max(0, weeklyCapacity - allocatedHours);

      if (remainingHours === 0) {
        throw new Error("This member is fully allocated and has no available hours remaining.");
      }

      if (hoursPerWeek > remainingHours) {
        throw new Error(`Only ${remainingHours} hours/week are available for this member.`);
      }
    }

    const status =
      type === "ASSIGNMENT_REQUEST" ? "PENDING" : "ACTIVE";

    const resourceData = {
      ...payload,
      employeeName: user.name,
      projectTarget: project.name,
      department: user.department,
      status,
      hoursPerWeek,
    };

    return await resourceRepository.createResource(resourceData);
  }

  async getAllResources() {
    return await resourceRepository.getAllResources();
  }

  async updateResourceStatus(id, status, comment) {
    const allowedStatuses = ["APPROVED", "REJECTED"];

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid resource status");
    }

    if (!comment || !comment.trim()) {
      throw new Error("An approval or rejection comment is required");
    }

    return await resourceRepository.updateResourceStatus(id, status, comment.trim());
  }

  async updateResource(id, payload) {
    if (payload.projectId || payload.userId) {
      const [project, user] = await Promise.all([
        payload.projectId ? Project.findByPk(payload.projectId) : null,
        payload.userId ? User.findByPk(payload.userId) : null,
      ]);

      if (payload.projectId && !project) throw new Error("Project not found");
      if (payload.userId && !user) throw new Error("User not found");
    }

    if (payload.hoursPerWeek !== undefined) {
      const hoursPerWeek = Number(payload.hoursPerWeek);
      if (!Number.isFinite(hoursPerWeek) || hoursPerWeek < 0 || hoursPerWeek > 45) {
        throw new Error("Hours per week must be between 0 and 45");
      }
      payload = { ...payload, hoursPerWeek };
    }
    return await resourceRepository.updateResource(id, payload);
  }
}

