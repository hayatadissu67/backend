import express from "express";

import budgetRoutes from "./budgetRoutes.js";
import changeRequestRoutes from "./changeRequestRoutes.js";
import projectRoutes from "./projectRoutes.js";
import riskRoutes from "./riskRoutes.js";
import authRoutes from "./authRoutes.js";
import { protect } from "../middleware/authMiddleware.js";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";
import reportRoutes from "./reportRoutes.js";
import templateRoutes from "./templateRoutes.js";
import resourceRoutes from "./resourceRoutes.js";

const router = express.Router();

// Auth routes (public)
router.use("/auth", authRoutes);

// Protected routes (require valid JWT)
router.use("/users", protect, userRoutes);
router.use("/tasks", protect, taskRoutes);
router.use("/reports", protect, reportRoutes);
router.use("/templates", protect, templateRoutes);
router.use("/budgets", protect, budgetRoutes);
router.use("/change-requests", protect, changeRequestRoutes);
router.use("/projects", protect, projectRoutes);
router.use("/risks", protect, riskRoutes);
router.use("/resources", protect, resourceRoutes);

export default router;