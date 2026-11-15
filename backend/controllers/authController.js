const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const HttpError = require('../utils/httpError');
const sendSuccess = require('../utils/response');
const createToken = require('../utils/tokenUtils');
const asyncHandler = require('../utils/asyncHandler');
const {
  requireText,
  requireEmail,
  requirePassword
} = require('../utils/validators');

const register = asyncHandler(async (req, res) => {
  const name = requireText(req.body.name, 'Name', 100);
  const email = requireEmail(req.body.email);
  const password = requirePassword(req.body.password);
  const passwordHash = await bcrypt.hash(password, 12);

  let user;

  try {
    user = await userModel.createUserWithPreferences(name, email, passwordHash);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'An account with this email already exists.');
    }

    throw error;
  }

  const token = createToken(user.id);

  return sendSuccess(res, 201, 'Account created successfully.', {
    token,
    user
  });
});

const login = asyncHandler(async (req, res) => {
  const email = requireEmail(req.body.email);
  const password = requirePassword(req.body.password);
  const userWithPassword = await userModel.findUserByEmail(email);

  if (!userWithPassword) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }

  const passwordMatches = await bcrypt.compare(password, userWithPassword.password_hash);

  if (!passwordMatches) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }

  const user = {
    id: userWithPassword.id,
    name: userWithPassword.name,
    email: userWithPassword.email,
    created_at: userWithPassword.created_at
  };

  const token = createToken(user.id);

  return sendSuccess(res, 200, 'Login successful.', {
    token,
    user
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await userModel.findPublicUserById(req.user.id);

  if (!user) {
    throw new HttpError(404, 'User not found.');
  }

  return sendSuccess(res, 200, 'Current user loaded.', user);
});

const updateCurrentUser = asyncHandler(async (req, res) => {
  const allowedFields = ['name'];
  const hasAllowedField = allowedFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field));

  if (!hasAllowedField) {
    throw new HttpError(400, 'Provide a name to update.');
  }

  const name = requireText(req.body.name, 'Name', 100);
  const user = await userModel.updateUserName(req.user.id, name);

  if (!user) {
    throw new HttpError(404, 'User not found.');
  }

  return sendSuccess(res, 200, 'Account details updated.', user);
});

module.exports = {
  register,
  login,
  getCurrentUser,
  updateCurrentUser
};
