const courseModel = require("../models/courseModel");
const assignmentModel = require("../models/assignmentModel");
const HttpError = require("../utils/httpError");
const sendSuccess = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");
const {
  requireText,
  requirePositiveId,
  requireIsoDateTime,
} = require("../utils/validators");
const { toMysqlUtcDateTime, toIsoDateTime } = require("../utils/dateUtils");

const validStatuses = ["pending", "completed"];
const validPriorities = ["low", "medium", "high"];

function validateAssignmentStatus(value) {
  if (!validStatuses.includes(value)) {
    throw new HttpError(400, "Status must be pending or completed.");
  }

  return value;
}

function validateAssignmentPriority(value) {
  if (!validPriorities.includes(value)) {
    throw new HttpError(400, "Priority must be low, medium or high.");
  }

  return value;
}

function formatAssignment(assignment) {
  if (!assignment) {
    return null;
  }

  return {
    ...assignment,
    due_at: toIsoDateTime(assignment.due_at),
  };
}

const listAssignments = asyncHandler(async (req, res) => {
  const status = req.query.status || "";
  const allowedFilters = ["", "upcoming", "overdue", "completed"];

  if (!allowedFilters.includes(status)) {
    throw new HttpError(400, "status must be upcoming, overdue or completed.");
  }

  let courseId = null;

  if (req.query.courseId !== undefined) {
    courseId = requirePositiveId(req.query.courseId, "courseId");
  }

  const assignments = await assignmentModel.getAssignmentsByUser(req.user.id, {
    status,
    courseId,
  });

  return sendSuccess(
    res,
    200,
    "Assignments loaded.",
    assignments.map(formatAssignment),
  );
});

const createAssignment = asyncHandler(async (req, res) => {
  const courseId = requirePositiveId(req.body.course_id, "course_id");
  const course = await courseModel.getCourseById(courseId, req.user.id);

  if (!course) {
    throw new HttpError(404, "Course not found.");
  }

  const title = requireText(req.body.title, "Title", 200);
  let description = null;

  if (req.body.description !== undefined && req.body.description !== null) {
    if (typeof req.body.description !== "string") {
      throw new HttpError(400, "Description must be text.");
    }

    if (req.body.description.length > 20000) {
      throw new HttpError(
        400,
        "Description must be 20000 characters or fewer.",
      );
    }

    description = req.body.description;
  }

  const dueDate = requireIsoDateTime(req.body.due_at, "due_at");
  const dueAt = toMysqlUtcDateTime(dueDate);
  const status =
    req.body.status === undefined
      ? "pending"
      : validateAssignmentStatus(req.body.status);
  const priority =
    req.body.priority === undefined
      ? "medium"
      : validateAssignmentPriority(req.body.priority);

  const assignment = await assignmentModel.createAssignment(
    req.user.id,
    courseId,
    title,
    description,
    dueAt,
    status,
    priority,
  );

  if (!assignment) {
    throw new HttpError(404, "Course not found.");
  }

  return sendSuccess(
    res,
    201,
    "Assignment created.",
    formatAssignment(assignment),
  );
});

const getAssignment = asyncHandler(async (req, res) => {
  const assignmentId = requirePositiveId(req.params.id, "Assignment id");
  const assignment = await assignmentModel.getAssignmentById(
    assignmentId,
    req.user.id,
  );

  if (!assignment) {
    throw new HttpError(404, "Assignment not found.");
  }

  return sendSuccess(
    res,
    200,
    "Assignment loaded.",
    formatAssignment(assignment),
  );
});

const updateAssignment = asyncHandler(async (req, res) => {
  const assignmentId = requirePositiveId(req.params.id, "Assignment id");
  const currentAssignment = await assignmentModel.getAssignmentById(
    assignmentId,
    req.user.id,
  );

  if (!currentAssignment) {
    throw new HttpError(404, "Assignment not found.");
  }

  const hasCourseId = Object.prototype.hasOwnProperty.call(
    req.body,
    "course_id",
  );
  const hasTitle = Object.prototype.hasOwnProperty.call(req.body, "title");
  const hasDescription = Object.prototype.hasOwnProperty.call(
    req.body,
    "description",
  );
  const hasDueAt = Object.prototype.hasOwnProperty.call(req.body, "due_at");
  const hasStatus = Object.prototype.hasOwnProperty.call(req.body, "status");
  const hasPriority = Object.prototype.hasOwnProperty.call(
    req.body,
    "priority",
  );

  if (
    !hasCourseId &&
    !hasTitle &&
    !hasDescription &&
    !hasDueAt &&
    !hasStatus &&
    !hasPriority
  ) {
    throw new HttpError(
      400,
      "Provide at least one assignment field to update.",
    );
  }

  const courseId = hasCourseId
    ? requirePositiveId(req.body.course_id, "course_id")
    : currentAssignment.course_id;
  const course = await courseModel.getCourseById(courseId, req.user.id);

  if (!course) {
    throw new HttpError(404, "Course not found.");
  }

  const title = hasTitle
    ? requireText(req.body.title, "Title", 200)
    : currentAssignment.title;

  let description = currentAssignment.description;

  if (hasDescription) {
    if (
      req.body.description !== null &&
      typeof req.body.description !== "string"
    ) {
      throw new HttpError(400, "Description must be text or null.");
    }

    if (
      typeof req.body.description === "string" &&
      req.body.description.length > 20000
    ) {
      throw new HttpError(
        400,
        "Description must be 20000 characters or fewer.",
      );
    }

    description = req.body.description;
  }

  const dueDate = hasDueAt
    ? requireIsoDateTime(req.body.due_at, "due_at")
    : new Date(toIsoDateTime(currentAssignment.due_at));
  const dueAt = toMysqlUtcDateTime(dueDate);
  const status = hasStatus
    ? validateAssignmentStatus(req.body.status)
    : currentAssignment.status;
  const priority = hasPriority
    ? validateAssignmentPriority(req.body.priority)
    : currentAssignment.priority;
  const currentDueAt = toIsoDateTime(currentAssignment.due_at);
  const currentDueAtSql = toMysqlUtcDateTime(new Date(currentDueAt));
  const dueAtChanged = dueAt !== currentDueAtSql;
  const reopened =
    currentAssignment.status !== "pending" && status === "pending";
  const updatedAssignment = await assignmentModel.updateAssignmentAndResetLogs(
    assignmentId,
    req.user.id,
    {
      courseId,
      title,
      description,
      dueAt,
      status,
      priority,
    },
    dueAtChanged || reopened,
  );

  return sendSuccess(
    res,
    200,
    "Assignment updated.",
    formatAssignment(updatedAssignment),
  );
});

const markAssignmentComplete = asyncHandler(async (req, res) => {
  const assignmentId = requirePositiveId(req.params.id, "Assignment id");
  const currentAssignment = await assignmentModel.getAssignmentById(
    assignmentId,
    req.user.id,
  );

  if (!currentAssignment) {
    throw new HttpError(404, "Assignment not found.");
  }

  const assignment = await assignmentModel.markAssignmentComplete(
    assignmentId,
    req.user.id,
  );
  return sendSuccess(
    res,
    200,
    "Assignment marked complete.",
    formatAssignment(assignment),
  );
});

const deleteAssignment = asyncHandler(async (req, res) => {
  const assignmentId = requirePositiveId(req.params.id, "Assignment id");
  const deleted = await assignmentModel.deleteAssignment(
    assignmentId,
    req.user.id,
  );

  if (!deleted) {
    throw new HttpError(404, "Assignment not found.");
  }

  return sendSuccess(res, 200, "Assignment deleted.", { id: assignmentId });
});

module.exports = {
  listAssignments,
  createAssignment,
  getAssignment,
  updateAssignment,
  markAssignmentComplete,
  deleteAssignment,
};
