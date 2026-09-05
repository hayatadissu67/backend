import { Router } from "express";
import { login, register, getMe } from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", protect, authorizeRoles("EXECUTIVE_MANAGER"), register);
router.get("/me", protect, getMe);

export default router;
