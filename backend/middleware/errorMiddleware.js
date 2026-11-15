const HttpError = require('../utils/httpError');

function notFound(req, res, next) {
  next(new HttpError(404, 'The requested endpoint does not exist.'));
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'An unexpected server error occurred.';

  if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body must contain valid JSON.';
  }

  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with these details already exists.';
  }

  if (statusCode >= 500) {
    message = 'An unexpected server error occurred.';
  }

  return res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
}

module.exports = {
  notFound,
  errorHandler
};
