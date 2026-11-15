const express = require('express');
const pool = require('../config/db');
const protect = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const sendSuccess = require('../utils/response');
const { requirePositiveId } = require('../utils/validators');

const router = express.Router();
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MAX_SLOTS = 100;

async function listSlots(userId) {
  const [rows] = await pool.execute(
    "SELECT id, course_id, weekday, TIME_FORMAT(start_time, '%H:%i') AS start_time FROM timetable_slots WHERE user_id = ? ORDER BY FIELD(weekday, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), start_time",
    [userId]
  );
  return rows;
}

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Timetable loaded.', await listSlots(req.user.id));
}));

// Replaces the user's whole weekly timetable.
router.put('/', asyncHandler(async (req, res) => {
  const slots = req.body.slots;

  if (!Array.isArray(slots) || slots.length > MAX_SLOTS) {
    throw new HttpError(400, `slots must be an array of at most ${MAX_SLOTS} items.`);
  }

  const rows = slots.map((slot) => {
    const courseId = requirePositiveId(slot && slot.course_id, 'course_id');

    if (!weekdays.includes(slot.weekday)) {
      throw new HttpError(400, 'weekday must be a day name such as Monday.');
    }

    if (typeof slot.start_time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.start_time)) {
      throw new HttpError(400, 'start_time must use HH:MM format.');
    }

    return [req.user.id, courseId, slot.weekday, slot.start_time];
  });

  const courseIds = [...new Set(rows.map((row) => row[1]))];

  if (courseIds.length) {
    const [owned] = await pool.query(
      'SELECT COUNT(*) AS n FROM courses WHERE user_id = ? AND id IN (?)',
      [req.user.id, courseIds]
    );

    if (Number(owned[0].n) !== courseIds.length) {
      throw new HttpError(404, 'Course not found.');
    }
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM timetable_slots WHERE user_id = ?', [req.user.id]);

    if (rows.length) {
      await connection.query(
        'INSERT INTO timetable_slots (user_id, course_id, weekday, start_time) VALUES ?',
        [rows]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return sendSuccess(res, 200, 'Timetable saved.', await listSlots(req.user.id));
}));

module.exports = router;
