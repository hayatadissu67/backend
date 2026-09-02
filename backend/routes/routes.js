import express from "express";

import budgetRoutes from "./budgetRoutes.js";
import changeRequestRoutes from "./changeRequestRoutes.js";
import projectRoutes from "./projectRoutes.js";
import riskRoutes from "./riskRoutes.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";
import reportRoutes from "./reportRoutes.js";
import templateRoutes from "./templateRoutes.js";

const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);

// Users routes
router.use("/users", userRoutes);

// Tasks routes
router.use("/tasks", taskRoutes);

// Reports routes
router.use("/reports", reportRoutes);

// Templates routes
router.use("/templates", templateRoutes);

// Budget routes
router.use("/budgets", budgetRoutes);

// Change Request routes
router.use("/change-requests", changeRequestRoutes);

// Project routes
router.use("/projects", projectRoutes);

// Risk routes
router.use("/risks", riskRoutes);

export default router;