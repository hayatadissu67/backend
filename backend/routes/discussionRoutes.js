import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDiscussions, createDiscussion } from "../controllers/discussionController.js";

const router = express.Router();

router.use(protect);
router.get("/", getDiscussions);
router.post("/", createDiscussion);

export default router;
