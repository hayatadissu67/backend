import { Router } from "express";
import { addUser, getUsers } from "../../controllers/authController/userController.js";

const router = Router();

router.post("/add", addUser);     // Add user
router.get("/", getUsers);        // Fetch all users with roles

export default router;
