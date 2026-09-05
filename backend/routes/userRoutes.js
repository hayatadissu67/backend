import { Router } from "express";
import { addUser, getUsers } from "../controllers/userController.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

// Backwards-compatible: allow POST /api/users (root) as well as /add for creating users
// Both endpoints require EXECUTIVE_MANAGER role (protect applied at parent router)
router.post("/", authorizeRoles("EXECUTIVE_MANAGER"), addUser);
router.post("/add", authorizeRoles("EXECUTIVE_MANAGER"), addUser);

// List users (Executive only)
router.get("/", authorizeRoles("EXECUTIVE_MANAGER"), getUsers);

export default router;
