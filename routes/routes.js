import express from "express";

import budgetRoutes from "./budgetRoutes/budgetRoutes.js";
import changeRequestRoutes from "./ChangeRequestRoutes/changeRequestRoutes.js";

const router = express.Router();

// Budget routes
router.use("/budgets", budgetRoutes);

// Change Request routes
router.use("/change-requests", changeRequestRoutes);

export default router;