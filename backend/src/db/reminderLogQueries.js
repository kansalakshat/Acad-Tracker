const pool = require('../config/database');

async function getLogsForAssignment(assignmentId) {
  const sql =
    'SELECT channel, hours_before FROM reminder_logs WHERE assignment_id = ?';
  const [rows] = await pool.query(sql, [assignmentId]);
  return rows;
}

async function insertReminderLog(assignmentId, userId, channel, hoursBefore) {
  const sql =
    'INSERT INTO reminder_logs (assignment_id, user_id, channel, hours_before) ' +
    'VALUES (?, ?, ?, ?)';

  try {
    await pool.query(sql, [assignmentId, userId, channel, hoursBefore]);
    return true;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return false;
    }
    throw error;
  }
}

module.exports = { getLogsForAssignment, insertReminderLog };
