const courseModel = require('../models/courseModel');
const HttpError = require('../utils/httpError');
const sendSuccess = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const {
  requireText,
  requireInteger,
  requirePositiveId
} = require('../utils/validators');

const listCourses = asyncHandler(async (req, res) => {
  const courses = await courseModel.getCoursesByUser(req.user.id);
  return sendSuccess(res, 200, 'Courses loaded.', courses);
});

const createCourse = asyncHandler(async (req, res) => {
  const name = requireText(req.body.name, 'Course name', 150);
  const code = requireText(req.body.code, 'Course code', 30);
  let minimumAttendance = 75;

  if (Object.prototype.hasOwnProperty.call(req.body, 'min_attendance_percent')) {
    minimumAttendance = requireInteger(
      req.body.min_attendance_percent,
      'min_attendance_percent',
      1,
      100
    );
  }

  const credits = Object.prototype.hasOwnProperty.call(req.body, 'credits')
    ? requireInteger(req.body.credits, 'credits', 1, 10)
    : 3;

  const course = await courseModel.createCourse(
    req.user.id,
    name,
    code,
    minimumAttendance,
    credits
  );

  return sendSuccess(res, 201, 'Course created.', course);
});

const getCourse = asyncHandler(async (req, res) => {
  const courseId = requirePositiveId(req.params.id, 'Course id');
  const course = await courseModel.getCourseById(courseId, req.user.id);

  if (!course) {
    throw new HttpError(404, 'Course not found.');
  }

  return sendSuccess(res, 200, 'Course loaded.', course);
});

const updateCourse = asyncHandler(async (req, res) => {
  const courseId = requirePositiveId(req.params.id, 'Course id');
  const currentCourse = await courseModel.getCourseById(courseId, req.user.id);

  if (!currentCourse) {
    throw new HttpError(404, 'Course not found.');
  }

  const hasName = Object.prototype.hasOwnProperty.call(req.body, 'name');
  const hasCode = Object.prototype.hasOwnProperty.call(req.body, 'code');
  const hasMinimum = Object.prototype.hasOwnProperty.call(req.body, 'min_attendance_percent');
  const hasCredits = Object.prototype.hasOwnProperty.call(req.body, 'credits');

  if (!hasName && !hasCode && !hasMinimum && !hasCredits) {
    throw new HttpError(400, 'Provide at least one course field to update.');
  }

  const name = hasName
    ? requireText(req.body.name, 'Course name', 150)
    : currentCourse.name;
  const code = hasCode
    ? requireText(req.body.code, 'Course code', 30)
    : currentCourse.code;
  const minimumAttendance = hasMinimum
    ? requireInteger(req.body.min_attendance_percent, 'min_attendance_percent', 1, 100)
    : currentCourse.min_attendance_percent;
  const credits = hasCredits
    ? requireInteger(req.body.credits, 'credits', 1, 10)
    : currentCourse.credits;

  const course = await courseModel.updateCourse(
    courseId,
    req.user.id,
    name,
    code,
    minimumAttendance,
    credits
  );

  return sendSuccess(res, 200, 'Course updated.', course);
});

const deleteCourse = asyncHandler(async (req, res) => {
  const courseId = requirePositiveId(req.params.id, 'Course id');
  const deleted = await courseModel.deleteCourse(courseId, req.user.id);

  if (!deleted) {
    throw new HttpError(404, 'Course not found.');
  }

  return sendSuccess(res, 200, 'Course deleted.', { id: courseId });
});

module.exports = {
  listCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse
};
