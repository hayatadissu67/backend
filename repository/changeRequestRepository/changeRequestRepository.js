//import { User } from "../models/User.js";
//import { Project } from "../models/Project.js";

export class ChangeRequestRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll() {
    return await this.model.findAll({
      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name", "email"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async findById(id) {
    return await this.model.findByPk(id, {
      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name", "email"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "name"],
        },
      ],
    });
  }

  async create(data) {
    return await this.model.create(data);
  }

  async update(id, data) {
    const changeRequest = await this.findById(id);

    if (!changeRequest) {
      return null;
    }

    return await changeRequest.update(data);
  }

  async delete(id) {
    const changeRequest = await this.findById(id);

    if (!changeRequest) {
      return false;
    }

    await changeRequest.destroy();
    return true;
  }
}