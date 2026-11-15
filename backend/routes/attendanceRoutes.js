
const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/courses/:courseId/attendance', attendanceController.listCourseAttendance);
router.post('/courses/:courseId/attendance', attendanceController.createCourseAttendance);

router.get('/attendance/summary', attendanceController.getAttendanceSummary);
router.put('/attendance/:id', attendanceController.updateAttendance);
router.delete('/attendance/:id', attendanceController.deleteAttendance);

module.exports = router;
