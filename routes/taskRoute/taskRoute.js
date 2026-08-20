import express from "express"
import taskController from "../../controllers/taskController/taskController.js";
export const router =express.Router;
router.post('/tasks', (req, res, next) => taskController.createTask(req, res, next));
router.get('/tasks', (req, res, next) => taskController.getTasks(req, res, next));
router.put('/tasks/:id', (req, res, next) => taskController.updateTask(req, res, next));
router.patch('/tasks/:id/status', (req, res, next) => taskController.updateStatus(req, res, next));
router.delete('/tasks/:id', (req, res, next) => taskController.deleteTask(req, res, next));

