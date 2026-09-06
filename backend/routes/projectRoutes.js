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
const router = express.Router();


export default router;
