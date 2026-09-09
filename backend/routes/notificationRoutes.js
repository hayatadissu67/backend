import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getNotifications, markNotificationsRead, clearNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.use(protect);
router.get("/", getNotifications);
router.patch("/read", markNotificationsRead);
router.patch("/clear", clearNotifications);

export default router;
