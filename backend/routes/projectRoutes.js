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
<<<<<<< HEAD
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { validateProject } from "../validations/projectValidation.js";

const router = express.Router();

router.use(protect); // All project routes require authentication

router.post("/", authorizeRoles("EXECUTIVE_MANAGER", "PROJECT_MANAGER"), validateProject, createProject);
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.put("/:id", authorizeRoles("EXECUTIVE_MANAGER", "PROJECT_MANAGER"), validateProject, updateProject);
router.delete("/:id", authorizeRoles("EXECUTIVE_MANAGER"), deleteProject);

// New endpoints
router.post("/:id/team", authorizeRoles("EXECUTIVE_MANAGER", "PROJECT_MANAGER"), assignTeam);
router.patch("/:id/approve", authorizeRoles("EXECUTIVE_MANAGER"), approveProject);
router.patch("/:id/reject", authorizeRoles("EXECUTIVE_MANAGER"), rejectProject);
=======
import { authorizePermission } from "../middleware/permissions.js";

const router = express.Router();

router.post("/", authorizePermission('projects.create'), createProject);
router.get("/", authorizePermission('projects.view'), getAllProjects);
router.get("/:id", authorizePermission('projects.view'), getProjectById);
router.put("/:id", authorizePermission('projects.update'), updateProject);
router.delete("/:id", authorizePermission('projects.update'), deleteProject);
>>>>>>> aa592568bb6d78f2d31bb02ac268b220f3f0ade9

export default router;
