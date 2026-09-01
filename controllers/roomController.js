const roomService = require('../services/roomService');
const messageService = require('../services/messageService');
const { getSocket } = require('../config/socket');

async function getRooms(req, res) {
  try {
    const rooms = await roomService.getRoomsForUser(req.user.id);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createRoom(req, res) {
  try {
    const room = await roomService.createRoom({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

async function getRoomMessages(req, res) {
  try {
    const { roomId } = req.params;
    const limit = req.query.limit;
    const offset = req.query.offset;
    const hasAccess = await roomService.hasAccess(roomId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this room' });
    }
    const messages = await messageService.getMessagesForRoom(roomId, limit, offset);
    return res.json(messages);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

async function postRoomMessage(req, res) {
  try {
    const { roomId } = req.params;
    const hasAccess = await roomService.hasAccess(roomId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this room' });
    }
    const message = await messageService.createMessage({
      roomId,
      senderId: req.user.id,
      content: req.body.content,
      replyTo: req.body.reply_to,
    });

    const io = getSocket();
    io.to(roomId).emit('new_message', message);

    return res.status(201).json(message);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

module.exports = {
  getRooms,
  createRoom,
  getRoomMessages,
  postRoomMessage,
};
