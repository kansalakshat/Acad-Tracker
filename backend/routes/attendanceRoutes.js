const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Per-course list/create live in courseRoutes: /api/courses/:courseId/attendance
router.get('/', attendanceController.listAttendanceByDate);
router.get('/summary', attendanceController.getAttendanceSummary);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;
