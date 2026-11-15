const HttpError = require('./httpError');

function requireText(value, fieldName, maximumLength) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, `${fieldName} is required.`);
  }

  const cleanValue = value.trim();

  if (cleanValue.length > maximumLength) {
    throw new HttpError(400, `${fieldName} must be ${maximumLength} characters or fewer.`);
  }

  return cleanValue;
}

function requireInteger(value, fieldName, minimum, maximum) {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new HttpError(400, `${fieldName} must be an integer.`);
  }

  if (value < minimum || value > maximum) {
    throw new HttpError(400, `${fieldName} must be between ${minimum} and ${maximum}.`);
  }

  return value;
}

function requirePositiveId(value, fieldName) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `${fieldName} must be a positive integer.`);
  }

  return id;
}

function requireEmail(value) {
  const email = requireText(value, 'Email', 255).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new HttpError(400, 'Enter a valid email address.');
  }

  if (!email.endsWith('@iitbhilai.ac.in')) {
    throw new HttpError(400, 'Use your @iitbhilai.ac.in email address.');
  }

  return email;
}

function requirePassword(value) {
  if (typeof value !== 'string' || value.length < 8) {
    throw new HttpError(400, 'Password must contain at least 8 characters.');
  }

  if (Buffer.byteLength(value, 'utf8') > 72) {
    throw new HttpError(400, 'Password must be 72 bytes or fewer.');
  }

  return value;
}

function requireDate(value, fieldName) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, `${fieldName} must use YYYY-MM-DD format.`);
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, `${fieldName} is not a valid calendar date.`);
  }

  return value;
}

function requireIsoDateTime(value, fieldName) {
  if (typeof value !== 'string') {
    throw new HttpError(400, `${fieldName} must be an ISO 8601 date-time string.`);
  }

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const hasDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value);
  const date = new Date(value);

  if (!hasTimezone || !hasDateTime || Number.isNaN(date.getTime())) {
    throw new HttpError(400, `${fieldName} must be a valid ISO 8601 date-time with a timezone.`);
  }

  return date;
}

function requireBoolean(value, fieldName) {
  if (typeof value !== 'boolean') {
    throw new HttpError(400, `${fieldName} must be true or false.`);
  }

  return value;
}

module.exports = {
  requireText,
  requireInteger,
  requirePositiveId,
  requireEmail,
  requirePassword,
  requireDate,
  requireIsoDateTime,
  requireBoolean
};
