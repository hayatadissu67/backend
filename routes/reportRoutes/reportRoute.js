import express from "express";
import { getReports, createReport, updateReport, deleteReport } from "../../controllers/reportControllers/reportController.js";

const router = express.Router();

router.get("/", getReports);
router.post("/", createReport);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport); // ID akka fudhatu mirkaneessi

export default router;