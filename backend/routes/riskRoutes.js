import express from "express";
import { authorizePermission } from "../middleware/permissions.js";
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

<<<<<<< HEAD
router.use(protect);

router.post("/", authorizeRoles("EXECUTIVE_MANAGER", "PROJECT_MANAGER", "RISK_MANAGER", "TEAM_MEMBER"), validateRisk, createRisk);
router.get("/", getAllRisks);
router.get("/:id", getRiskById);
router.put("/:id", authorizeRoles("EXECUTIVE_MANAGER", "PROJECT_MANAGER", "RISK_MANAGER", "TEAM_MEMBER"), validateRisk, updateRisk);
router.delete("/:id", authorizeRoles("EXECUTIVE_MANAGER", "RISK_MANAGER"), deleteRisk);
=======
router.post("/", authorizePermission('risks.create'), createRisk);
router.get("/", authorizePermission('risks.view'), getAllRisks);
router.get("/:id", authorizePermission('risks.view'), getRiskById);
router.put("/:id", authorizePermission('risks.update'), updateRisk);
router.delete("/:id", authorizePermission('risks.delete'), deleteRisk);
>>>>>>> aa592568bb6d78f2d31bb02ac268b220f3f0ade9

export default router;
