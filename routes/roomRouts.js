import express from 'express';
import { getRooms, createRoom, getRoomMessages, postRoomMessage } from '../controllers/roomController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getRooms);
router.post('/', createRoom);
router.get('/:roomId/messages', getRoomMessages);
router.post('/:roomId/messages', postRoomMessage);

export default router;
