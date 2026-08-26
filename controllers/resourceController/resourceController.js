import { ResourceService } from "../../services/resourceService/resourceService.js";

// Create an instance of the service
const resourceService = new ResourceService();

class ResourceController {
  async createResource(req, res) {
    const resource = await resourceService.createResource(req.body); // Use the instance

    res.status(201).json({
      success: true,
      data: resource,
    });
  }

  async getResources(req, res) {
    const resources = await resourceService.getAllResources(); // Use the instance

    res.status(200).json({
      success: true,
      data: resources,
    });
  }

  async updateResourceStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    const resource = await resourceService.updateResourceStatus(id, status); // Use the instance

    res.status(200).json({
      success: true,
      data: resource,
    });
  }
}

export default new ResourceController();