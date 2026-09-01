import { Resource } from "../../models/resourceModel/Resource.js";

export class ResourceRepository {
  async createResource(data) {
    return await Resource.create(data);
  }

  async getAllResources() {
    return await Resource.findAll({
      order: [["createdAt", "DESC"]],
    });
  }

  async updateResourceStatus(id, status) {
    const resource = await Resource.findByPk(id);

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

    await resource.save();

    return resource;
  }
}

