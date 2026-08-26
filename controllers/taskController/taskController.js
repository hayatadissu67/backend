import { TaskService } from "../../services/taskService/taskService.js";

const taskService = new TaskService();

class TaskController {
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.body);

      return res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTasks(req, res, next) {
    try {
      const tasks = await taskService.getAllTasks();

      return res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await taskService.updateTaskStatus(id, status);

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { id } = req.params;

      const updatedTask = await taskService.updateTask(id, req.body);

      return res.status(200).json({
        success: true,
        data: updatedTask,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;

      await taskService.deleteTask(id);

      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();