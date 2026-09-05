import express from "express";
import { authorizePermission } from "../middleware/permissions.js";
import { getReports, createReport, updateReport, deleteReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/", authorizePermission('reports.view'), getReports);
router.post("/", authorizePermission('reports.create'), createReport);
router.put("/:id", authorizePermission('reports.update'), updateReport);
router.delete("/:id", authorizePermission('reports.delete'), deleteReport); // ID akka fudhatu mirkaneessi

export default router;