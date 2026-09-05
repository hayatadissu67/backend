import express from "express";
import multer from "multer";
import { authorizePermission } from "../middleware/permissions.js";
import { getReports, getReportById, createReport, updateReport, deleteReport } from "../controllers/reportController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/", authorizePermission('reports.view'), getReports);
router.get("/:id", authorizePermission('reports.view'), getReportById);
router.post("/", authorizePermission('reports.create'), upload.single("file"), createReport);
router.put("/:id", authorizePermission('reports.update'), upload.single("file"), updateReport);
router.delete("/:id", authorizePermission('reports.delete'), deleteReport); // ID akka fudhatu mirkaneessi

export default router;