import { sequelize } from '../config/db.js';

async function markRead(messageId, userId) {
  try {
    await sequelize.query(
      'INSERT INTO read_receipts (message_id, user_id, read_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [messageId, userId]
    );
    return { added: true };
  } catch (err) {
    await sequelize.query(
      'UPDATE read_receipts SET read_at = CURRENT_TIMESTAMP WHERE message_id = ? AND user_id = ?',
      [messageId, userId]
    );
    return { updated: true };
  }
}

async function markReadBatch(messageIds, userId) {
  const results = [];
  for (const messageId of messageIds) {
    try {
      results.push({ messageId, result: await markRead(messageId, userId) });
    } catch (err) {
      results.push({ messageId, error: err.message });
    }
  }
  return results;
}

async function getReadReceipts(messageId) {
  const [rows] = await sequelize.query('SELECT user_id, read_at FROM read_receipts WHERE message_id = ?', [messageId]);
  return rows;
}

async function getUnreadCountForUserInRoom(roomId, userId) {
  const [rows] = await sequelize.query(
    `SELECT COUNT(*) AS unread_count
     FROM messages m
     LEFT JOIN read_receipts rr ON rr.message_id = m.id AND rr.user_id = ?
     WHERE m.room_id = ? AND rr.id IS NULL`,
    [userId, roomId]
  );
  return rows[0]?.unread_count || 0;
}

export {
  markRead,
  markReadBatch,
  getReadReceipts,
  getUnreadCountForUserInRoom,
};
