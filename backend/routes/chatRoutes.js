import express from "express";

import {
  getRooms,
  createRoom,
  getMessages,
  sendMessage,
  toggleReaction,
  getReactions,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/rooms", getRooms);
router.post("/rooms", createRoom);

router.get("/rooms/:roomId/messages", getMessages);
router.post("/rooms/:roomId/messages", sendMessage);

router.post("/messages/:messageId/reactions", toggleReaction);
router.get("/messages/:messageId/reactions", getReactions);



export default router;