import express from "express";
import multer from "multer";
import { authorizePermission } from "../middleware/permissions.js";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from "../controllers/templateController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/", authorizePermission('templates.view'), getTemplates);
router.post("/", authorizePermission('templates.create'), upload.single("file"), createTemplate);
router.put("/:id", authorizePermission('templates.update'), upload.single("file"), updateTemplate);
router.delete("/:id", authorizePermission('templates.delete'), deleteTemplate);

export default router;