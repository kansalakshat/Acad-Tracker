const pool = require('../config/db');

async function getAssignmentsByUser(userId, filters) {
  let query = `SELECT
    a.id,
    a.user_id,
    a.course_id,
    a.title,
    a.description,
    a.due_at,
    a.status,
    a.priority,
    a.type,
    a.created_at,
    c.name AS course_name,
    c.code AS course_code
  FROM assignments a
  INNER JOIN courses c ON c.id = a.course_id AND c.user_id = ?
  WHERE a.user_id = ?`;

  const parameters = [userId, userId];

  if (filters.status === 'upcoming') {
    query += " AND a.status = 'pending' AND a.due_at > UTC_TIMESTAMP()";
  } else if (filters.status === 'overdue') {
    query += " AND a.status = 'pending' AND a.due_at < UTC_TIMESTAMP()";
  } else if (filters.status === 'completed') {
    query += " AND a.status = 'completed'";
  }

  if (filters.courseId) {
    query += ' AND a.course_id = ?';
    parameters.push(filters.courseId);
  }

  query += ' ORDER BY a.due_at ASC, a.id ASC';

  const [rows] = await pool.execute(query, parameters);
  return rows;
}

async function getAssignmentById(assignmentId, userId) {
  const [rows] = await pool.execute(
    `SELECT
      a.id,
      a.user_id,
      a.course_id,
      a.title,
      a.description,
      a.due_at,
      a.status,
      a.priority,
      a.type,
      a.created_at,
      c.name AS course_name,
      c.code AS course_code
    FROM assignments a
    INNER JOIN courses c ON c.id = a.course_id AND c.user_id = ?
    WHERE a.id = ? AND a.user_id = ?`,
    [userId, assignmentId, userId]
  );

  return rows[0] || null;
}

async function createAssignment(userId, courseId, title, description, dueAt, status, priority, type) {
  const [result] = await pool.execute(
    `INSERT INTO assignments (user_id, course_id, title, description, due_at, status, priority, type)
    SELECT ?, c.id, ?, ?, ?, ?, ?, ? FROM courses c WHERE c.id = ? AND c.user_id = ?`,
    [userId, title, description, dueAt, status, priority, type, courseId, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getAssignmentById(result.insertId, userId);
}

async function updateAssignmentAndResetLogs(assignmentId, userId, values, resetReminderLogs) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      `UPDATE assignments
      SET course_id = ?, title = ?, description = ?, due_at = ?, status = ?, priority = ?, type = ?
      WHERE id = ? AND user_id = ?`,
      [
        values.courseId,
        values.title,
        values.description,
        values.dueAt,
        values.status,
        values.priority,
        values.type,
        assignmentId,
        userId
      ]
    );

    if (resetReminderLogs) {
      await connection.execute(
        'DELETE FROM reminder_logs WHERE assignment_id = ? AND user_id = ?',
        [assignmentId, userId]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return getAssignmentById(assignmentId, userId);
}

async function markAssignmentComplete(assignmentId, userId) {
  const [result] = await pool.execute(
    "UPDATE assignments SET status = 'completed' WHERE id = ? AND user_id = ?",
    [assignmentId, userId]
  );

  if (result.affectedRows === 0) {
    return getAssignmentById(assignmentId, userId);
  }

  return getAssignmentById(assignmentId, userId);
}

async function deleteAssignment(assignmentId, userId) {
  const [result] = await pool.execute(
    'DELETE FROM assignments WHERE id = ? AND user_id = ?',
    [assignmentId, userId]
  );

  return result.affectedRows > 0;
}

module.exports = {
  getAssignmentsByUser,
  getAssignmentById,
  createAssignment,
  updateAssignmentAndResetLogs,
  markAssignmentComplete,
  deleteAssignment
};
