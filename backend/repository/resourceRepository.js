import { Resource } from "../models/Resource.js";
import { Op } from "sequelize";

export class ResourceRepository {
  static async findExistingAssignmentRequest(projectId, userId) {
    return await Resource.findOne({
      where: {
        projectId,
        userId,
        type: "ASSIGNMENT_REQUEST",
        status: { [Op.in]: ["PENDING", "APPROVED"] },
      },
    });
  }

  static async getActiveAllocationHours(userId) {
    const total = await Resource.sum("hoursPerWeek", {
      where: {
        userId,
        type: "ALLOCATION",
        status: "ACTIVE",
      },
    });
    return Number(total || 0);
  }

  async createResource(data) {
    return await Resource.create(data);
  }

  async getAllResources() {
    return await Resource.findAll({
      include: [
        { association: "project" },
        { association: "user", attributes: { exclude: ["password"] } },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async updateResourceStatus(id, status, comment) {
    const resource = await Resource.findByPk(id, {
      include: ["project", { association: "user", attributes: { exclude: ["password"] } }],
    });

    if (!resource) {
      throw new Error("Resource not found");
    }

    if (resource.type !== "ASSIGNMENT_REQUEST") {
      throw new Error(
        "Only assignment requests can be approved or rejected"
      );
    }

    if (resource.status !== "PENDING") {
      throw new Error(
        "Only pending requests can be approved or rejected"
      );
    }

    resource.status = status;
    resource.approvalComment = status === "APPROVED" ? comment : null;
    resource.rejectionComment = status === "REJECTED" ? comment : null;

    await resource.save();

    return resource;
  }

  async updateResource(id, data) {
    const resource = await Resource.findByPk(id, {
      include: ["project", { association: "user", attributes: { exclude: ["password"] } }],
    });

    if (!resource) {
      throw new Error("Resource not found");
    }

    await resource.update(data);
    return resource;
  }
}

