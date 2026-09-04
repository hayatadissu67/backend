import { TaskRepository } from "../../repository/taskRepository/taskRepository.js";

const taskRepository = new TaskRepository();

class TaskService {
  async createTask(data) {
    const hours = parseInt(data.estimatedWorkHours, 10);
    if (isNaN(hours) || hours < 0) {
      throw new Error('estimatedWorkHours must be a valid positive integer');
    }

    return await taskRepository.create({
      title: data.title,
      targetProject: data.targetProject,
      assignee: data.assignee,
      priority: data.priority || 'MEDIUM',
      estimatedWorkHours: hours,
      completionDeadline: data.completionDeadline,
      status: data.status || 'TO_DO',
      description: data.description,
    });
  }

  async getAllTasks() {
    return await taskRepository.findAll();
  }

  async updateTaskStatus(id, status) {
    const updatedTask = await taskRepository.updateStatus(id, status);
    if (!updatedTask) {
      throw new Error('Task not found');
    }
    return updatedTask;
  }
async updateTask(id, data) {
  const updatedTask = await taskRepository.update(id, {
    title: data.title,
    assignee: data.assignee,
    priority: data.priority,
    status: data.status,
    completionDeadline: data.completionDeadline,
    estimatedWorkHours: data.estimatedWorkHours,
    progress: data.progress,
    description: data.description,
  });

  if (!updatedTask) {
    throw new Error('Task not found');
  }

  return updatedTask;
}
  async deleteTask(id) {
    const deletedTask = await taskRepository.delete(id);
    if (!deletedTask) {
      throw new Error('Task not found');
    }
    return deletedTask;
  }
}

export const taskService = new TaskService();