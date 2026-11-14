const pool = require('../config/database');

async function getPendingAssignmentsBatch(now, lastId, batchSize) {
  const sql =
    'SELECT ' +
    'a.id AS assignment_id, a.user_id, a.title, a.due_at, ' +
    'c.name AS course_name, c.code AS course_code, ' +
    'u.name AS user_name, u.email AS user_email, ' +
    'p.email_enabled, p.browser_enabled, p.remind_before_hours ' +
    'FROM assignments a ' +
    'JOIN users u ON u.id = a.user_id ' +
    'JOIN courses c ON c.id = a.course_id ' +
    'LEFT JOIN notification_preferences p ON p.user_id = a.user_id ' +
    "WHERE a.status = 'pending' AND a.due_at > ? AND a.id > ? " +
    'ORDER BY a.id ASC ' +
    'LIMIT ?';

  const [rows] = await pool.query(sql, [now, lastId, batchSize]);
  return rows;
}

module.exports = { getPendingAssignmentsBatch };
