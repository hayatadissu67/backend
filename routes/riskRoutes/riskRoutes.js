import express from "express";
import {
  createRisk,
  getAllRisks,
  getRiskById,
  updateRisk,
  deleteRisk,
} from "../../controllers/riskcontroller/riskcontroller.js";

const router = express.Router();

router.post("/", createRisk);
router.get("/", getAllRisks);
router.get("/:id", getRiskById);
router.put("/:id", updateRisk);
router.delete("/:id", deleteRisk);

export default router;
