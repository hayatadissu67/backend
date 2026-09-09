import { Router } from "express";
import { login, register, getCurrentUser, changePassword } from "../controllers/authController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", protect, authorize("EXECUTIVE_MANAGER"), register);
router.get("/me", protect, getCurrentUser);
router.post("/change-password", protect, changePassword);

export default router;
