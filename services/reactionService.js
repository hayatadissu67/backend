const pool = require('../config/db');

async function toggleReaction(messageId, userId, emoji) {
  const [exists] = await pool.query(
    'SELECT * FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
    [messageId, userId, emoji]
  );

  if (exists.length > 0) {
    await pool.query(
      'DELETE FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
      [messageId, userId, emoji]
    );
    return { removed: true };
  }

  await pool.query(
    'INSERT INTO reactions (message_id, user_id, emoji) VALUES (?, ?, ?)',
    [messageId, userId, emoji]
  );
  return { added: true };
}

async function getReactionsForMessage(messageId) {
  const [rows] = await pool.query(
    'SELECT user_id, emoji FROM reactions WHERE message_id = ?',
    [messageId]
  );
  return rows;
}

module.exports = {
  toggleReaction,
  getReactionsForMessage,
};
