const notificationModel = require('../models/notificationModel');
const HttpError = require('../utils/httpError');
const sendSuccess = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const {
  requireText,
  requireBoolean
} = require('../utils/validators');
const { validateReminderHours } = require('../utils/reminderHours');

const getPreferences = asyncHandler(async (req, res) => {
  const preferences = await notificationModel.getPreferences(req.user.id);
  return sendSuccess(res, 200, 'Notification preferences loaded.', preferences);
});

const updatePreferences = asyncHandler(async (req, res) => {
  const allowedFields = ['email_enabled', 'browser_enabled', 'remind_before_hours'];
  const hasUpdate = allowedFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field));

  if (!hasUpdate) {
    throw new HttpError(400, 'Provide at least one notification preference to update.');
  }

  const current = await notificationModel.getPreferences(req.user.id);
  const emailEnabled = Object.prototype.hasOwnProperty.call(req.body, 'email_enabled')
    ? requireBoolean(req.body.email_enabled, 'email_enabled')
    : current.email_enabled;
  const browserEnabled = Object.prototype.hasOwnProperty.call(req.body, 'browser_enabled')
    ? requireBoolean(req.body.browser_enabled, 'browser_enabled')
    : current.browser_enabled;
  const remindBeforeHours = Object.prototype.hasOwnProperty.call(req.body, 'remind_before_hours')
    ? validateReminderHours(req.body.remind_before_hours)
    : current.remind_before_hours;

  const preferences = await notificationModel.updatePreferences(req.user.id, {
    emailEnabled,
    browserEnabled,
    remindBeforeHours
  });

  return sendSuccess(res, 200, 'Notification preferences updated.', preferences);
});

const getVapidPublicKey = asyncHandler(async (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;

  if (!publicKey) {
    throw new HttpError(500, 'VAPID public key is not configured on the server.');
  }

  return sendSuccess(res, 200, 'VAPID public key loaded.', { public_key: publicKey });
});

const savePushSubscription = asyncHandler(async (req, res) => {
  const endpoint = requireText(req.body.endpoint, 'endpoint', 500);
  const p256dh = requireText(req.body.p256dh, 'p256dh', 255);
  const auth = requireText(req.body.auth, 'auth', 255);

  if (!endpoint.startsWith('https://')) {
    throw new HttpError(400, 'Push subscription endpoint must use HTTPS.');
  }

  await notificationModel.savePushSubscription(req.user.id, endpoint, p256dh, auth);
  return sendSuccess(res, 200, 'Push subscription saved.', { saved: true });
});

const deletePushSubscription = asyncHandler(async (req, res) => {
  const endpoint = requireText(req.body.endpoint, 'endpoint', 500);
  const deleted = await notificationModel.deletePushSubscription(req.user.id, endpoint);

  if (!deleted) {
    throw new HttpError(404, 'Push subscription not found.');
  }

  return sendSuccess(res, 200, 'Push subscription deleted.', { deleted: true });
});

module.exports = {
  getPreferences,
  updatePreferences,
  getVapidPublicKey,
  savePushSubscription,
  deletePushSubscription
};
