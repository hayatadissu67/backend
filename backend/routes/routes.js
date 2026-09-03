import express from "express";

import budgetRoutes from "./budgetRoutes/budgetRoutes.js";
import changeRequestRoutes from "./ChangeRequestRoutes/changeRequestRoutes.js";
import projectRoutes from "./projectRoutes/projectRoutes.js";
import riskRoutes from "./riskRoutes/riskRoutes.js";
import authRoute from "./authRoute/authRoute.js";
import { protect } from "../middleware/authMiddleware.js";

import userRoutes from "./userRoutes/userRoutes.js";

const router = express.Router();

// Auth routes (unprotected)
router.use("/auth", authRoute);

// Protected routes
router.use(protect);
router.use("/users", userRoutes);
router.use("/budgets", budgetRoutes);
router.use("/change-requests", changeRequestRoutes);
router.use("/projects", projectRoutes);
router.use("/risks", riskRoutes);

export default router;