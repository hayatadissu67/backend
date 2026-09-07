import express from "express";
import { getNotifications, markNotificationRead, createNotification } from "../controllers/communicationController.js";

const router = express.Router();

router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markNotificationRead);
router.post("/notifications", createNotification);

// Mock endpoints to prevent 404s on frontend
router.get("/discussions", (req, res) => res.json({ success: true, data: [] }));
router.get("/meetings", (req, res) => res.json({ success: true, data: [] }));

export default router;
