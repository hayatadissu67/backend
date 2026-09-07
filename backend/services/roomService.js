const pool = require('../config/db');
const { validateRoomName, validateUserId, validateRoomId } = require('../middleware/validation');

async function getRoomsForUser(userId) {
  if (!validateUserId(userId)) {
    const error = new Error('Invalid user ID');
    error.status = 400;
    throw error;
  }

  const [rows] = await pool.query(
    `SELECT DISTINCT r.*
     FROM rooms r
     LEFT JOIN room_members rm ON r.id = rm.room_id AND rm.user_id = ?
     WHERE r.type = 'public' OR r.created_by = ? OR rm.user_id IS NOT NULL
     ORDER BY r.created_at DESC`,
    [userId, userId]
  );
  return rows;
}

async function createRoom({ name, type, project_id, createdBy }) {
  if (!validateRoomName(name)) {
    const error = new Error('Room name is required and must be between 2 and 100 characters');
    error.status = 400;
    throw error;
  }

  if (!validateUserId(createdBy)) {
    const error = new Error('Invalid creator ID');
    error.status = 400;
    throw error;
  }

  const [result] = await pool.query(
    'INSERT INTO rooms (name, type, project_id, created_by) VALUES (?, ?, ?, ?)',
    [name, type || 'public', project_id || null, createdBy]
  );

  const roomId = result && (result.insertId || result.lastID);
  console.log('[DEBUG] Room insert result:', JSON.stringify(result), 'roomId:', roomId);
  
  if (!roomId) {
    const error = new Error('Failed to create room');
    error.status = 500;
    throw error;
  }

  await pool.query(
    'INSERT INTO room_members (room_id, user_id) VALUES (?, ?)',
    [roomId, createdBy]
  );

  const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
  return rows[0];
}

async function addMember(roomId, userId) {
  await pool.query(
    'INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)',
    [roomId, userId]
  );
  return { roomId, userId, added: true };
}

async function removeMember(roomId, userId) {
  await pool.query(
    'DELETE FROM room_members WHERE room_id = ? AND user_id = ?',
    [roomId, userId]
  );
  return { roomId, userId, removed: true };
}

async function hasAccess(roomId, userId) {
  const [rows] = await pool.query(
    `SELECT r.id
     FROM rooms r
     LEFT JOIN room_members rm ON r.id = rm.room_id AND rm.user_id = ?
     WHERE r.id = ? AND (r.type = 'public' OR r.created_by = ? OR rm.user_id IS NOT NULL)`,
    [userId, roomId, userId]
  );
  return rows.length > 0;
}

module.exports = {
  getRoomsForUser,
  createRoom,
  addMember,
  removeMember,
  hasAccess,
};
