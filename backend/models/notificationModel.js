const pool = require('../config/db');
const {
  toDatabaseReminderHours,
  toApiReminderHours
} = require('../utils/reminderHours');

async function getPreferences(userId) {
  await pool.execute(
    'INSERT IGNORE INTO notification_preferences (user_id) VALUES (?)',
    [userId]
  );

  const [rows] = await pool.execute(
    'SELECT user_id, email_enabled, browser_enabled, remind_before_hours FROM notification_preferences WHERE user_id = ?',
    [userId]
  );

  const row = rows[0];

  return {
    user_id: row.user_id,
    email_enabled: Boolean(row.email_enabled),
    browser_enabled: Boolean(row.browser_enabled),
    remind_before_hours: toApiReminderHours(row.remind_before_hours)
  };
}

async function updatePreferences(userId, values) {
  await pool.execute(
    `UPDATE notification_preferences
    SET email_enabled = ?, browser_enabled = ?, remind_before_hours = ?
    WHERE user_id = ?`,
    [
      values.emailEnabled,
      values.browserEnabled,
      toDatabaseReminderHours(values.remindBeforeHours),
      userId
    ]
  );

  return getPreferences(userId);
}

async function savePushSubscription(userId, endpoint, p256dh, auth) {
  await pool.execute(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE id = id`,
    [userId, endpoint, p256dh, auth]
  );
}

async function deletePushSubscription(userId, endpoint) {
  const [result] = await pool.execute(
    'DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
    [userId, endpoint]
  );

  return result.affectedRows > 0;
}

module.exports = {
  getPreferences,
  updatePreferences,
  savePushSubscription,
  deletePushSubscription
};
