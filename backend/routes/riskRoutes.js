import express from "express";
import {
  createRisk,
  getAllRisks,
  getRiskById,
  updateRisk,
  deleteRisk,
} from "../controllers/riskController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { validateRisk } from "../validations/riskValidation.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("EXECUTIVE_MANAGER", "PROJECT_MANAGER", "RISK_MANAGER", "TEAM_MEMBER"), validateRisk, createRisk);
router.get("/", getAllRisks);
router.get("/:id", getRiskById);
router.put("/:id", authorizeRoles("EXECUTIVE_MANAGER", "PROJECT_MANAGER", "RISK_MANAGER", "TEAM_MEMBER"), validateRisk, updateRisk);
router.delete("/:id", authorizeRoles("EXECUTIVE_MANAGER", "RISK_MANAGER"), deleteRisk);

export default router;
