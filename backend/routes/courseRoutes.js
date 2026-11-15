const express = require('express');
const courseController = require('../controllers/courseController');
const attendanceController = require('../controllers/attendanceController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', courseController.listCourses);
router.post('/', courseController.createCourse);
router.get('/:courseId/attendance', attendanceController.listCourseAttendance);
router.post('/:courseId/attendance', attendanceController.createCourseAttendance);
router.get('/:id', courseController.getCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
