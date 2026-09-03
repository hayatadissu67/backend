const express = require('express');
const reactionController = require('../controllers/reactionController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:messageId/reactions', authenticate, reactionController.toggleReaction);
router.get('/:messageId/reactions', reactionController.getReactions);

module.exports = router;
