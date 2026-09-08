import express from "express";
import multer from "multer";
import {
	getChannels,
	createChannel,
	getMessages,
	createMessage,
	updateMessage,
	getNotifications,
	markNotificationRead,
	createNotification,
	markAllNotificationsRead,
	clearNotifications,
	getDiscussions,
	createDiscussion,
	getMeetings,
	createMeeting,
	getDocuments,
	createDocument,
	downloadDocument,
	deleteDocument,
} from "../controllers/communicationController.js";

const router = express.Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 25 * 1024 * 1024 },
});

router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markNotificationRead);
router.post("/notifications", createNotification);
router.put("/notifications/read", markAllNotificationsRead);
router.delete("/notifications/clear", clearNotifications);

router.get("/channels", getChannels);
router.post("/channels", createChannel);
router.get("/messages", getMessages);
router.post("/messages", createMessage);
router.patch("/messages/:id", updateMessage);

router.get("/discussions", getDiscussions);
router.post("/discussions", createDiscussion);
router.get("/meetings", getMeetings);
router.post("/meetings", createMeeting);
router.get("/documents", getDocuments);
router.post("/documents", upload.single("file"), createDocument);
router.get("/documents/:id/download", downloadDocument);
router.delete("/documents/:id", deleteDocument);

export default router;
