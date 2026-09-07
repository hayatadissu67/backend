import { Router } from "express";
import { login, register, getCurrentUser } from "../controllers/authController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", protect, authorize("EXECUTIVE_MANAGER"), register);
router.get("/me", protect, getCurrentUser);

export default router;
