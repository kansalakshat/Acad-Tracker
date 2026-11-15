const pool = require('../config/db');

async function getAttendanceByCourse(courseId, userId) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, course_id, class_date, status, created_at FROM attendance_records WHERE course_id = ? AND user_id = ? ORDER BY class_date DESC, id DESC',
    [courseId, userId]
  );

  return rows;
}

async function getAttendanceByDate(userId, classDate) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, course_id, class_date, status, created_at FROM attendance_records WHERE user_id = ? AND class_date = ?',
    [userId, classDate]
  );

  return rows;
}

async function createAttendance(userId, courseId, classDate, status) {
  const [result] = await pool.execute(
    `INSERT INTO attendance_records (user_id, course_id, class_date, status)
    SELECT ?, c.id, ?, ? FROM courses c WHERE c.id = ? AND c.user_id = ?`,
    [userId, classDate, status, courseId, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.execute(
    'SELECT id, user_id, course_id, class_date, status, created_at FROM attendance_records WHERE id = ? AND user_id = ?',
    [result.insertId, userId]
  );

  return rows[0];
}

async function getAttendanceById(recordId, userId) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, course_id, class_date, status, created_at FROM attendance_records WHERE id = ? AND user_id = ?',
    [recordId, userId]
  );

  return rows[0] || null;
}

async function updateAttendance(recordId, userId, classDate, status) {
  await pool.execute(
    'UPDATE attendance_records SET class_date = COALESCE(?, class_date), status = COALESCE(?, status) WHERE id = ? AND user_id = ?',
    [classDate, status, recordId, userId]
  );

  return getAttendanceById(recordId, userId);
}

async function deleteAttendance(recordId, userId) {
  const [result] = await pool.execute(
    'DELETE FROM attendance_records WHERE id = ? AND user_id = ?',
    [recordId, userId]
  );

  return result.affectedRows > 0;
}

async function getAttendanceSummaryRows(userId) {
  const [rows] = await pool.execute(
    `SELECT
      c.id AS course_id,
      c.name,
      c.code,
      c.min_attendance_percent,
      COALESCE(SUM(CASE WHEN a.status IN ('present', 'absent') THEN 1 ELSE 0 END), 0) AS total_classes,
      COALESCE(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END), 0) AS attended,
      COALESCE(SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END), 0) AS cancelled
    FROM courses c
    LEFT JOIN attendance_records a
      ON a.course_id = c.id AND a.user_id = ?
    WHERE c.user_id = ?
    GROUP BY c.id, c.name, c.code, c.min_attendance_percent
    ORDER BY c.name ASC`,
    [userId, userId]
  );

  return rows;
}

module.exports = {
  getAttendanceByCourse,
  getAttendanceByDate,
  createAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getAttendanceSummaryRows
};
