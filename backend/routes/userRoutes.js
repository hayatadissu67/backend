import { Router } from "express";
import {
  addUser,
  getUsers,
  getTeamMembers,
  updateUser,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = Router();

// Public-to-any-authenticated-user endpoint: list TEAM_MEMBER accounts.
// PMs use this to populate the "Assign Member" / dashboard team views.
router.get("/team-members", protect, getTeamMembers);

// Backwards-compatible: allow POST /api/users (root) as well as /add for creating users
// Both endpoints require EXECUTIVE_MANAGER role (protect applied at parent router)
router.post("/", authorizeRoles("EXECUTIVE_MANAGER"), addUser);
router.post("/add", authorizeRoles("EXECUTIVE_MANAGER"), addUser);

// List users (Executive only)
router.get("/", authorizeRoles("EXECUTIVE_MANAGER"), getUsers);

// Update / status / delete
router.put("/:id", authorizeRoles("EXECUTIVE_MANAGER"), updateUser);
router.patch(
  "/:id/status",
  authorizeRoles("EXECUTIVE_MANAGER"),
  updateUserStatus
);
router.delete("/:id", authorizeRoles("EXECUTIVE_MANAGER"), deleteUser);

export default router;