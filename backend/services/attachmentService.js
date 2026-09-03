const pool = require('../config/db');

async function createAttachment({ messageId, filename, url, uploadedBy }) {
  const [result] = await pool.query(
    'INSERT INTO attachments (message_id, filename, url, uploaded_by) VALUES (?, ?, ?, ?)',
    [messageId, filename, url, uploadedBy || null]
  );

  const id = result && (result.insertId || result.lastID);
  const [rows] = await pool.query('SELECT * FROM attachments WHERE id = ?', [id]);
  return rows[0];
}

async function getAttachmentsForMessage(messageId) {
  const [rows] = await pool.query('SELECT * FROM attachments WHERE message_id = ?', [messageId]);
  return rows;
}

module.exports = {
  createAttachment,
  getAttachmentsForMessage,
};
