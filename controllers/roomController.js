import { getRoomsForUser, createRoom as createRoomService, hasAccess } from '../services/roomService.js';
import { getMessagesForRoom, createMessage } from '../services/messageService.js';
import { getSocket } from '../config/socket.js';

async function getRooms(req, res) {
  try {
    const rooms = await getRoomsForUser(req.user.id);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createRoom(req, res) {
  try {
    const room = await createRoomService({
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
    const access = await hasAccess(roomId, req.user.id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied to this room' });
    }
    const messages = await getMessagesForRoom(roomId, limit, offset);
    return res.json(messages);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

async function postRoomMessage(req, res) {
  try {
    const { roomId } = req.params;
    const access = await hasAccess(roomId, req.user.id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied to this room' });
    }
    const message = await createMessage({
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

export {
  getRooms,
  createRoom,
  getRoomMessages,
  postRoomMessage,
};
