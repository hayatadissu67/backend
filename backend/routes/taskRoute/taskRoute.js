import express from "express";
import * as taskController from "../../controllers/taskController/taskController.js";

const router = express.Router();

router.post('/', (req, res, next) => taskController.createTask(req, res, next));
router.get('/', (req, res, next) => taskController.getTasks(req, res, next));
router.put('/:id', (req, res, next) => taskController.updateTask(req, res, next));
router.patch('/:id/status', (req, res, next) => taskController.updateStatus(req, res, next));
router.delete('/:id', (req, res, next) => taskController.deleteTask(req, res, next));

export default router;
