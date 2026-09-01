import { Task } from "../../models/taskModel/taskModel.js";

class TaskRepository {
  async create(data) {
    return await Task.create(data);
  }

  async findAll() {
    return await Task.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id) {
    return await Task.findByPk(id);
  }

  async updateStatus(id, status) {
    const task = await Task.findByPk(id);
    if (!task) return null;
    task.status = status;
    await task.save();
    return task;
  }
async update(id, data) {
  const task = await Task.findByPk(id);

  if (!task) return null;

  await task.update(data);

  return task;
}
  async delete(id) {
    const task = await Task.findByPk(id);
    if (!task) return null;
    await task.destroy();
    return task;
  }
};

export {TaskRepository}