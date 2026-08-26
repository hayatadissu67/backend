import { ResourceRepository } from "../../repository/resourceRepository/resourceRepository.js"

const resourceRepository = new ResourceRepository();

export class ResourceService {
  async createResource(payload) {
    const { type } = payload;

    const status =
      type === "ASSIGNMENT_REQUEST" ? "PENDING" : "ACTIVE";

    const hoursPerWeek = payload.hoursPerWeek
      ? Number(payload.hoursPerWeek)
      : 40;

    const resourceData = {
      ...payload,
      status,
      hoursPerWeek,
    };

    return await resourceRepository.createResource(resourceData);
  }

  async getAllResources() {
    return await resourceRepository.getAllResources();
  }

  async updateResourceStatus(id, status) {
    const allowedStatuses = ["APPROVED", "REJECTED"];

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid resource status");
    }

    return await resourceRepository.updateResourceStatus(id, status);
  }
}

