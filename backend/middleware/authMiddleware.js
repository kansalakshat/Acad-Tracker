const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authentication is required.');
  }

  const token = authorization.slice(7).trim();
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new HttpError(401, 'Your session is invalid or has expired.');
  }

  const userId = Number(payload.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new HttpError(401, 'Your session is invalid or has expired.');
  }

  const user = await userModel.findPublicUserById(userId);

  if (!user) {
    throw new HttpError(401, 'Your account could not be found.');
  }

  req.user = { id: userId };
  next();
});

module.exports = protect;
