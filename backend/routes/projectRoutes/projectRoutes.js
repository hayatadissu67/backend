import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  approveProject,
  rejectProject,
  assignProjectTeam,
  getProjectTeam,
  deleteProjectPermanent,
  submitClosure,
  closeProject,
  rejectClosure
} from "../../controllers/projectcontroller/projectcontroller.js";
import { validateRequest, createProjectSchema, updateProjectSchema, rejectProjectSchema } from "../../middleware/validationMiddleware.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authorize("EXECUTIVE_MANAGER", "PROJECT_MANAGER"), validateRequest(createProjectSchema), createProject);
router.get("/", protect, getAllProjects);
router.get("/:id", getProjectById);
router.put("/:id", authorize("EXECUTIVE_MANAGER", "PROJECT_MANAGER"), validateRequest(updateProjectSchema), updateProject);
router.patch("/:id/approve", authorize("EXECUTIVE_MANAGER"), approveProject);
router.patch("/:id/reject", authorize("EXECUTIVE_MANAGER"), validateRequest(rejectProjectSchema), rejectProject);
router.patch("/:id/submit-closure", authorize("EXECUTIVE_MANAGER", "PROJECT_MANAGER"), submitClosure);
router.patch("/:id/close", authorize("EXECUTIVE_MANAGER"), closeProject);
router.patch("/:id/reject-closure", authorize("EXECUTIVE_MANAGER"), rejectClosure);
router.delete("/:id", authorize("EXECUTIVE_MANAGER", "PROJECT_MANAGER"), deleteProject);
router.delete("/:id/permanent", authorize("EXECUTIVE_MANAGER"), deleteProjectPermanent);
router.get("/:id/team", authorize("EXECUTIVE_MANAGER", "PROJECT_MANAGER", "TEAM_MEMBER"), getProjectTeam);
router.post("/:id/team", authorize("PROJECT_MANAGER"), assignProjectTeam);

export default router;
