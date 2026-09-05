import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignTeam,
  approveProject,
  rejectProject
} from "../controllers/projectController.js";
import { authorizePermission } from "../middleware/permissions.js";

const router = express.Router();

router.post("/", authorizePermission('projects.create'), createProject);
router.get("/", authorizePermission('projects.view'), getAllProjects);
router.get("/:id", authorizePermission('projects.view'), getProjectById);
router.put("/:id", authorizePermission('projects.update'), updateProject);
router.delete("/:id", authorizePermission('projects.update'), deleteProject);

// Team assignment and approval endpoints
router.post("/:id/team", authorizePermission('projects.update'), assignTeam);
router.patch("/:id/approve", authorizePermission('projects.approve'), approveProject);
router.patch("/:id/reject", authorizePermission('projects.approve'), rejectProject);

export default router;