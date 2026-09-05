import express from "express";
import { authorizePermission } from "../middleware/permissions.js";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from "../controllers/templateController.js";

const router = express.Router();

router.get("/", authorizePermission('templates.view'), getTemplates);
router.post("/", authorizePermission('templates.create'), createTemplate);
router.put("/:id", authorizePermission('templates.update'), updateTemplate);
router.delete("/:id", authorizePermission('templates.delete'), deleteTemplate);

export default router;