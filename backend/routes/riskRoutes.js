import express from "express";
import { authorizePermission } from "../middleware/permissions.js";
import {
  createRisk,
  getAllRisks,
  getRiskById,
  updateRisk,
  deleteRisk,
} from "../controllers/riskController.js";

const router = express.Router();

router.post("/", authorizePermission('risks.create'), createRisk);
router.get("/", authorizePermission('risks.view'), getAllRisks);
router.get("/:id", authorizePermission('risks.view'), getRiskById);
router.put("/:id", authorizePermission('risks.update'), updateRisk);
router.delete("/:id", authorizePermission('risks.delete'), deleteRisk);

export default router;
