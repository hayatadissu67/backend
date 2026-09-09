import { Router } from "express";
import {
  addUser,
  getUsers,
  getTeamMembers,
  getUserProjects,
  updateUser,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

// Public-to-any-authenticated-user endpoint: list TEAM_MEMBER accounts.
router.get("/team-members", protect, getTeamMembers);

// Projects associated with a specific user (owner or assigned)
router.get("/:id/projects", protect, getUserProjects);

// Backwards-compatible: allow POST /api/users (root) as well as /add for creating users
router.post("/", authorize("EXECUTIVE_MANAGER"), addUser);
router.post("/add", authorize("EXECUTIVE_MANAGER"), addUser);

// List users (Executive only)
router.get("/", authorize("EXECUTIVE_MANAGER"), getUsers);

// Update / status / delete
router.put("/:id", authorize("EXECUTIVE_MANAGER"), updateUser);
router.patch(
  "/:id/status",
  authorize("EXECUTIVE_MANAGER"),
  updateUserStatus
);
router.delete("/:id", authorize("EXECUTIVE_MANAGER"), deleteUser);

export default router;