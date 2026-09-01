import { sequelize } from '../config/db.js';

async function createAttachment({ messageId, filename, url, uploadedBy }) {
  const [result] = await sequelize.query(
    'INSERT INTO attachments (message_id, filename, url, uploaded_by) VALUES (?, ?, ?, ?)',
    [messageId, filename, url, uploadedBy || null]
  );

  const id = result && (result.insertId || result.lastID);
  const [rows] = await sequelize.query('SELECT * FROM attachments WHERE id = ?', [id]);
  return rows[0];
}

async function getAttachmentsForMessage(messageId) {
  const [rows] = await sequelize.query('SELECT * FROM attachments WHERE message_id = ?', [messageId]);
  return rows;
}

export {
  createAttachment,
  getAttachmentsForMessage,
};
