const HttpError = require('./httpError');

function validateReminderHours(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpError(400, 'remind_before_hours must be a non-empty array.');
  }

  const seen = new Set();

  for (const hours of value) {
    if (typeof hours !== 'number' || !Number.isInteger(hours) || hours <= 0) {
      throw new HttpError(400, 'Each reminder value must be a positive integer.');
    }

    if (seen.has(hours)) {
      throw new HttpError(400, 'Reminder hours cannot contain duplicates.');
    }

    seen.add(hours);
  }

  return value;
}

function toDatabaseReminderHours(value) {
  const validHours = validateReminderHours(value);
  return validHours.join(',');
}

function toApiReminderHours(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('The stored reminder preferences are invalid.');
  }

  const values = value.split(',').map((item) => Number(item));

  if (values.some((item) => !Number.isInteger(item) || item <= 0)) {
    throw new Error('The stored reminder preferences are invalid.');
  }

  if (new Set(values).size !== values.length) {
    throw new Error('The stored reminder preferences are invalid.');
  }

  return values;
}

module.exports = {
  validateReminderHours,
  toDatabaseReminderHours,
  toApiReminderHours
};
