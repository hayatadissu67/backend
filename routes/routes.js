import express from "express";

import budgetRoutes from "./budgetRoutes/budgetRoutes.js";
import changeRequestRoutes from "./ChangeRequestRoutes/changeRequestRoutes.js";
import projectRoutes from "./projectRoutes/projectRoutes.js";
import riskRoutes from "./riskRoutes/riskRoutes.js";

const router = express.Router();

// Budget routes
router.use("/budgets", budgetRoutes);

// Change Request routes
router.use("/change-requests", changeRequestRoutes);

// Project routes
router.use("/projects", projectRoutes);

// Risk routes
router.use("/risks", riskRoutes);

export default router;