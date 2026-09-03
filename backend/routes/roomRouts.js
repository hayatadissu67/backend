const express = require('express');
const roomController = require('../controllers/roomController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.get('/', roomController.getRooms);
router.post('/', roomController.createRoom);
router.get('/:roomId/messages', roomController.getRoomMessages);
router.post('/:roomId/messages', roomController.postRoomMessage);

module.exports = router;
