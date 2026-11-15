const courseModel = require('../models/courseModel');
const attendanceModel = require('../models/attendanceModel');
const HttpError = require('../utils/httpError');
const sendSuccess = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const {
  requireDate,
  requirePositiveId
} = require('../utils/validators');

function validateAttendanceStatus(value) {
  if (value !== 'present' && value !== 'absent') {
    throw new HttpError(400, 'Status must be present or absent.');
  }

  return value;
}

const listCourseAttendance = asyncHandler(async (req, res) => {
  const courseId = requirePositiveId(req.params.courseId, 'Course id');
  const course = await courseModel.getCourseById(courseId, req.user.id);

  if (!course) {
    throw new HttpError(404, 'Course not found.');
  }

  const records = await attendanceModel.getAttendanceByCourse(courseId, req.user.id);
  return sendSuccess(res, 200, 'Attendance records loaded.', records);
});

const createCourseAttendance = asyncHandler(async (req, res) => {
  const courseId = requirePositiveId(req.params.courseId, 'Course id');
  const course = await courseModel.getCourseById(courseId, req.user.id);

  if (!course) {
    throw new HttpError(404, 'Course not found.');
  }

  const classDate = requireDate(req.body.class_date, 'class_date');
  const status = validateAttendanceStatus(req.body.status);
  const record = await attendanceModel.createAttendance(
    req.user.id,
    courseId,
    classDate,
    status
  );

  if (!record) {
    throw new HttpError(404, 'Course not found.');
  }

  return sendSuccess(res, 201, 'Attendance marked.', record);
});

const updateAttendance = asyncHandler(async (req, res) => {
  const recordId = requirePositiveId(req.params.id, 'Attendance id');
  const currentRecord = await attendanceModel.getAttendanceById(recordId, req.user.id);

  if (!currentRecord) {
    throw new HttpError(404, 'Attendance record not found.');
  }

  const hasDate = Object.prototype.hasOwnProperty.call(req.body, 'class_date');
  const hasStatus = Object.prototype.hasOwnProperty.call(req.body, 'status');

  if (!hasDate && !hasStatus) {
    throw new HttpError(400, 'Provide class_date or status to update.');
  }

  const classDate = hasDate
    ? requireDate(req.body.class_date, 'class_date')
    : null;
  const status = hasStatus
    ? validateAttendanceStatus(req.body.status)
    : null;

  const record = await attendanceModel.updateAttendance(
    recordId,
    req.user.id,
    classDate,
    status
  );

  return sendSuccess(res, 200, 'Attendance record updated.', record);
});

const deleteAttendance = asyncHandler(async (req, res) => {
  const recordId = requirePositiveId(req.params.id, 'Attendance id');
  const deleted = await attendanceModel.deleteAttendance(recordId, req.user.id);

  if (!deleted) {
    throw new HttpError(404, 'Attendance record not found.');
  }

  return sendSuccess(res, 200, 'Attendance record deleted.', { id: recordId });
});

const getAttendanceSummary = asyncHandler(async (req, res) => {
  const rows = await attendanceModel.getAttendanceSummaryRows(req.user.id);
  const summary = rows.map((row) => {
    const totalClasses = Number(row.total_classes);
    const attended = Number(row.attended);
    const minimumAttendance = Number(row.min_attendance_percent);
    const rawPercentage = totalClasses === 0
      ? 100
      : (attended / totalClasses) * 100;
    const percentage = Number(rawPercentage.toFixed(2));
    const isSafe = attended * 100 >= minimumAttendance * totalClasses;
    const result = {
      course_id: row.course_id,
      name: row.name,
      code: row.code,
      total_classes: totalClasses,
      attended,
      percentage,
      min_attendance_percent: minimumAttendance,
      is_safe: isSafe
    };

    if (isSafe) {
      if (minimumAttendance === 100) {
        result.can_miss = 0;
      } else {
        result.can_miss = Math.max(
          0,
          Math.floor((attended * 100) / minimumAttendance - totalClasses)
        );
      }
    } else if (minimumAttendance === 100) {
      result.must_attend = null;
      result.message = 'Recovery is impossible because 100% attendance is required.';
    } else {
      result.must_attend = Math.ceil(
        (minimumAttendance * totalClasses - 100 * attended) /
        (100 - minimumAttendance)
      );
    }

    return result;
  });

  return sendSuccess(res, 200, 'Attendance summary loaded.', summary);
});

module.exports = {
  listCourseAttendance,
  createCourseAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceSummary
};
