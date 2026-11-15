const pool = require('../config/db');

async function getCoursesByUser(userId) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, name, code, min_attendance_percent, credits, created_at FROM courses WHERE user_id = ? ORDER BY name ASC',
    [userId]
  );

  return rows;
}

async function getCourseById(courseId, userId) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, name, code, min_attendance_percent, credits, created_at FROM courses WHERE id = ? AND user_id = ?',
    [courseId, userId]
  );

  return rows[0] || null;
}

async function createCourse(userId, name, code, minimumAttendance, credits) {
  const [result] = await pool.execute(
    'INSERT INTO courses (user_id, name, code, min_attendance_percent, credits) VALUES (?, ?, ?, ?, ?)',
    [userId, name, code, minimumAttendance, credits]
  );

  return getCourseById(result.insertId, userId);
}

async function updateCourse(courseId, userId, name, code, minimumAttendance, credits) {
  const [result] = await pool.execute(
    'UPDATE courses SET name = ?, code = ?, min_attendance_percent = ?, credits = ? WHERE id = ? AND user_id = ?',
    [name, code, minimumAttendance, credits, courseId, userId]
  );

  if (result.affectedRows === 0) {
    const existingCourse = await getCourseById(courseId, userId);
    return existingCourse;
  }

  return getCourseById(courseId, userId);
}

async function deleteCourse(courseId, userId) {
  const [result] = await pool.execute(
    'DELETE FROM courses WHERE id = ? AND user_id = ?',
    [courseId, userId]
  );

  return result.affectedRows > 0;
}

module.exports = {
  getCoursesByUser,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
