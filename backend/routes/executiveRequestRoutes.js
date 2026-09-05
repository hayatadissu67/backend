import express from "express";
import { authorizePermission } from "../middleware/permissions.js";
import {
  getAllExecutiveRequests,
  getPendingExecutiveRequests,
  getExecutiveAuditLog,
  createExecutiveRequest,
  approveExecutiveRequest,
  rejectExecutiveRequest,
} from "../controllers/executiveRequestController.js";

const router = express.Router();

router.get("/", authorizePermission('templates.view'), getAllExecutiveRequests);
router.get("/pending", authorizePermission('templates.view'), getPendingExecutiveRequests);
router.get("/audit", authorizePermission('templates.view'), getExecutiveAuditLog);
router.post("/", authorizePermission('templates.create'), createExecutiveRequest);
router.patch("/:id/approve", authorizePermission('templates.approve'), approveExecutiveRequest);
router.patch("/:id/reject", authorizePermission('templates.approve'), rejectExecutiveRequest);

export default router;
