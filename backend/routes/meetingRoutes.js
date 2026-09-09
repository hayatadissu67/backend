import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMeetings, createMeeting } from "../controllers/meetingController.js";

const router = express.Router();

router.use(protect);
router.get("/", getMeetings);
router.post("/", createMeeting);

export default router;
