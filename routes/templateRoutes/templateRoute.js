import express from "express";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from "../../controllers/templateControllers/templateController.js";

const router = express.Router();

router.get("/", getTemplates);
router.post("/", createTemplate);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);

export default router;