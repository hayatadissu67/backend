import { TaskRepository } from "../repository/taskRepository.js"

const taskRepository = new TaskRepository();

/**
 * Derives the correct status from a progress value.
 * Does NOT handle the 3-day BLOCKED condition — that is evaluated
 * separately on update because it requires a time comparison.
 *
 * 0–20   → TO_DO
 * 21–99  → IN_PROGRESS (may become BLOCKED if stalled — checked on update)
 * 100    → COMPLETED
 */
function deriveStatusFromProgress(progress) {
  if (progress >= 100) return 'COMPLETED';
  if (progress >= 21)  return 'IN_PROGRESS';
  return 'TO_DO';
}

class TaskService {
  async createTask(data) {
    const hours = parseInt(data.estimatedWorkHours, 10);
    if (isNaN(hours) || hours < 0) {
      throw new Error('estimatedWorkHours must be a valid positive integer');
    }

    const today = new Date().toISOString().split('T')[0];
    if (data.completionDeadline && data.completionDeadline < today) {
      throw new Error('Completion deadline cannot be in the past.');
    }

    // Duplicate check: same assignee + same title at top level
    const duplicate = await taskRepository.findDuplicate(
      data.assignee,
      data.title,
      null
    );
    if (duplicate) {
      throw new Error(
        `"${data.assignee}" is already assigned to a task titled "${data.title}". Duplicate assignments are not allowed.`
      );
    }

    // New tasks always start at TO_DO (progress 0)
    const mainTask = await taskRepository.create({
      title: data.title,
      targetProject: data.targetProject,
      assignee: data.assignee,
      priority: data.priority || 'MEDIUM',
      estimatedWorkHours: hours,
      completionDeadline: data.completionDeadline,
      status: 'TO_DO',
      progress: 0,
      description: data.description,
      parentTaskId: null,
      progressUpdatedAt: null,
    });

    // Create sub-tasks with duplicate check per sub-task
    if (Array.isArray(data.subTasks) && data.subTasks.length > 0) {
      const seen = new Set();
      const subTaskPromises = [];

      for (const st of data.subTasks) {
        if (!st.title || !st.title.trim()) continue;
        const stTitle = st.title.trim();

        // In-request duplicate (same title submitted twice in the same batch)
        if (seen.has(stTitle)) {
          throw new Error(
            `Duplicate sub-task title "${stTitle}" submitted in the same request.`
          );
        }
        seen.add(stTitle);

        // DB-level duplicate check for sub-tasks
        const subDuplicate = await taskRepository.findDuplicate(
          data.assignee,
          stTitle,
          mainTask.id
        );
        if (subDuplicate) {
          throw new Error(
            `"${data.assignee}" is already assigned to sub-task "${stTitle}" under this task.`
          );
        }

        subTaskPromises.push(
          taskRepository.create({
            title: stTitle,
            targetProject: data.targetProject,
            assignee: data.assignee,
            priority: data.priority || 'MEDIUM',
            estimatedWorkHours: hours,
            completionDeadline: data.completionDeadline,
            status: 'TO_DO',
            progress: 0,
            description: st.description || '',
            parentTaskId: mainTask.id,
            progressUpdatedAt: null,
          })
        );
      }
      await Promise.all(subTaskPromises);
    }

    return await taskRepository.findById(mainTask.id);
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
    const existing = await taskRepository.findById(id);
    if (!existing) throw new Error('Task not found');

    // Auto-derive status from progress
    let newStatus = existing.status;
    let newProgressUpdatedAt = existing.progressUpdatedAt;
    const incomingProgress = data.progress !== undefined ? Number(data.progress) : existing.progress;

    if (incomingProgress !== undefined) {
      const derived = deriveStatusFromProgress(incomingProgress);

      if (derived === 'TO_DO' || derived === 'COMPLETED') {
        // Clear edges — always trust the derived value
        newStatus = derived;
        newProgressUpdatedAt = derived === 'COMPLETED' ? new Date() : null;
      } else {
        // IN_PROGRESS range (21–99): check for BLOCKED condition
        const prevProgress = existing.progress ?? 0;

        if (incomingProgress > prevProgress) {
          // Progress increased — reset the stall timer
          newStatus = 'IN_PROGRESS';
          newProgressUpdatedAt = new Date();
        } else {
          // Progress has not increased — check if stalled ≥ 3 days
          const stalledSince = existing.progressUpdatedAt
            ? new Date(existing.progressUpdatedAt)
            : new Date();
          const daysSinceUpdate =
            (Date.now() - stalledSince.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSinceUpdate >= 3) {
            newStatus = 'BLOCKED';
          } else {
            newStatus = 'IN_PROGRESS';
          }
          // Don't update progressUpdatedAt when progress didn't increase
        }
      }
    }

    const updatedTask = await taskRepository.update(id, {
      title:               data.title,
      assignee:            data.assignee,
      priority:            data.priority,
      status:              newStatus,
      completionDeadline:  data.completionDeadline,
      estimatedWorkHours:  data.estimatedWorkHours,
      progress:            incomingProgress,
      description:         data.description,
      progressUpdatedAt:   newProgressUpdatedAt,
    });

    if (!updatedTask) throw new Error('Task not found');
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

export { TaskService };