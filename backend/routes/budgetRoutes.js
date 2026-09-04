import express from "express";
import { authorizePermission } from "../middleware/permissions.js";

import {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetController.js";

const router = express.Router();

router.post("/", authorizePermission('budgets.create'), createBudget);
router.get("/", authorizePermission('budgets.view'), getAllBudgets);
router.get("/:id", authorizePermission('budgets.view'), getBudgetById);
router.put("/:id", authorizePermission('budgets.update'), updateBudget);
router.delete("/:id", authorizePermission('budgets.delete'), deleteBudget);

export default router;