export class ChangeRequestService {
  constructor(changeRequestRepository) {
    this.changeRequestRepository = changeRequestRepository;
  }

  async getAllChangeRequests() {
    return await this.changeRequestRepository.findAll();
  }

  async getChangeRequestById(id) {
    const changeRequest =
      await this.changeRequestRepository.findById(id);

    if (!changeRequest) {
      throw new Error("Change request not found");
    }

    return changeRequest;
  }

  async createChangeRequest(data) {
    if (!data.projectId) {
      throw new Error("Project ID is required");
    }

    if (!data.requesterId) {
      throw new Error("Requester ID is required");
    }

    if (!data.title) {
      throw new Error("Title is required");
    }

    return await this.changeRequestRepository.create(data);
  }

  async updateChangeRequest(id, data) {
    const changeRequest =
      await this.changeRequestRepository.findById(id);

    if (!changeRequest) {
      throw new Error("Change request not found");
    }

    return await this.changeRequestRepository.update(id, data);
  }

  async deleteChangeRequest(id) {
    const changeRequest =
      await this.changeRequestRepository.findById(id);

    if (!changeRequest) {
      throw new Error("Change request not found");
    }

    await this.changeRequestRepository.delete(id);

    return {
      message: "Change request deleted successfully",
    };
  }
}