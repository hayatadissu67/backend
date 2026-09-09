import express from "express";
import {
  createRisk,
  getAllRisks,
  getRiskById,
  updateRisk,
  deleteRisk,
} from "../../controllers/riskcontroller/riskcontroller.js";
import { validateRequest, createRiskSchema, updateRiskSchema } from "../../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/", validateRequest(createRiskSchema), createRisk);
router.get("/", getAllRisks);
router.get("/:id", getRiskById);
router.put("/:id", validateRequest(updateRiskSchema), updateRisk);
router.delete("/:id", deleteRisk);

export default router;
