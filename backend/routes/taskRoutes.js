import express from "express"
import taskController from "../controllers/taskController.js";
import { authorizePermission } from "../middleware/permissions.js";

 const router = express.Router();
router.post('/', authorizePermission('tasks.create'), (req, res, next) => taskController.createTask(req, res, next));
router.get('/', authorizePermission('tasks.view'), (req, res, next) => taskController.getTasks(req, res, next));
router.put('/:id', authorizePermission('tasks.update'), (req, res, next) => taskController.updateTask(req, res, next));
router.patch('/:id/status', authorizePermission('tasks.update'), (req, res, next) => taskController.updateStatus(req, res, next));
router.delete('/:id', authorizePermission('tasks.update'), (req, res, next) => taskController.deleteTask(req, res, next));
 export default router
