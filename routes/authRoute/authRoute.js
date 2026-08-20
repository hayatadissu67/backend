import { Router } from "express";
import { login } from "../../controllers/authController/authController.js";

const router = Router();

router.post("/login", login);
router.post("/register", ()=>{});

export default router;