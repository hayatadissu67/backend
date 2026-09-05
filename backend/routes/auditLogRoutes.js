import express from "express";
import { authorizePermission } from "../middleware/permissions.js";
import { getAuditLogs, getAuditLogsByEntity } from "../controllers/auditLogController.js";

const router = express.Router();

router.get("/", authorizePermission('templates.view'), getAuditLogs);
router.get("/entity/:entityType/:entityId", authorizePermission('templates.view'), getAuditLogsByEntity);

export default router;
