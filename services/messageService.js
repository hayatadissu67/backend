import { sequelize } from '../config/db.js';
import { validateRoomId, validateUserId, validateMessageContent, sanitizeString } from '../middleware/validation.js';

function normalizeLimit(value, fallback = 50) {
  const limit = Number.parseInt(value, 10);
  if (Number.isNaN(limit) || limit < 1) return fallback;
  return Math.min(limit, 200);
}

function normalizeOffset(value) {
  const offset = Number.parseInt(value, 10);
  if (Number.isNaN(offset) || offset < 0) return 0;
  return offset;
}

async function getMessagesForRoom(roomId, limit, offset) {
  if (!validateRoomId(roomId)) {
    const error = new Error('Invalid room ID');
    error.status = 400;
    throw error;
  }

  const safeLimit = normalizeLimit(limit, 50);
  const safeOffset = normalizeOffset(offset);

  const [rows] = await sequelize.query(
    `SELECT m.*, u.full_name as sender_name, u.avatar
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.room_id = ?
     ORDER BY m.created_at DESC
     LIMIT ? OFFSET ?`,
    [roomId, safeLimit, safeOffset]
  );

  return rows.reverse();
}

async function createMessage({ roomId, senderId, content, replyTo }) {
  if (!validateRoomId(roomId)) {
    const err = new Error('Invalid room ID');
    err.status = 400;
    throw err;
  }

  if (!validateUserId(senderId)) {
    const err = new Error('Invalid sender ID');
    err.status = 400;
    throw err;
  }

  if (!validateMessageContent(content)) {
    const err = new Error('Message content is required and must be less than 5000 characters');
    err.status = 400;
    throw err;
  }

  if (replyTo && !Number.isInteger(replyTo)) {
    const err = new Error('Invalid reply_to value');
    err.status = 400;
    throw err;
  }

  const cleanedContent = sanitizeString(content, 5000);

  const [result] = await sequelize.query(
    'INSERT INTO messages (room_id, sender_id, content, reply_to) VALUES (?, ?, ?, ?)',
    [roomId, senderId, cleanedContent, replyTo || null]
  );

  const messageId = result.insertId || result.lastID;
  const [rows] = await sequelize.query(
    `SELECT m.*, u.full_name as sender_name, u.avatar
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.id = ?`,
    [messageId]
  );

  return rows[0];
}

export {
  getMessagesForRoom,
  createMessage,
};
