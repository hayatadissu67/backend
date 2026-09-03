import express from "express";
import { createUser, getAllUsers, updateUserStatus, deleteUser } from "../../controllers/userController/userController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.put("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

export default router;
