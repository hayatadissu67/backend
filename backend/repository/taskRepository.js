import { Task } from "../models/taskModel.js";
import { Op } from "sequelize";

class TaskRepository {
  async create(data) {
    return await Task.create(data);
  }

  // Check whether the same assignee already has a task with the same title
  // under the same parent (null = top-level duplicate, uuid = sub-task duplicate)
  async findDuplicate(assignee, title, parentTaskId = null) {
    return await Task.findOne({
      where: {
        assignee,
        title,
        parentTaskId: parentTaskId === null ? { [Op.is]: null } : parentTaskId,
      },
    });
  }

  async findAll() {
    try {
      // Return only top-level tasks with their sub-tasks nested
      return await Task.findAll({
        where: { parentTaskId: null },
        include: [{ model: Task, as: 'subTasks' }],
        order: [['createdAt', 'DESC']],
      });
    } catch (err) {
      // parentTaskId column may not exist yet on first startup — fall back
      // to a plain findAll so the GET /tasks endpoint never returns 500
      if (err?.parent?.code === 'ER_BAD_FIELD_ERROR' || err?.original?.code === 'ER_BAD_FIELD_ERROR') {
        console.warn('⚠️ parentTaskId column not yet available; returning flat task list.');
        return await Task.findAll({ order: [['createdAt', 'DESC']] });
      }
      throw err;
    }
  }

  async findById(id) {
    try {
      return await Task.findByPk(id, {
        include: [{ model: Task, as: 'subTasks' }],
      });
    } catch (err) {
      return await Task.findByPk(id);
    }
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
    await task.destroy();   // CASCADE deletes sub-tasks via DB constraint
    return task;
  }
}

export {TaskRepository};