import express from 'express';
import { toggleReaction, getReactions } from '../controllers/reactionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:messageId/reactions', authenticate, toggleReaction);
router.get('/:messageId/reactions', getReactions);

export default router;
