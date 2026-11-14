const pool = require('../config/database');

async function getSubscriptionsForUser(userId) {
  const sql =
    'SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?';
  const [rows] = await pool.query(sql, [userId]);
  return rows;
}

async function deleteSubscriptionById(subscriptionId) {
  const sql = 'DELETE FROM push_subscriptions WHERE id = ?';
  await pool.query(sql, [subscriptionId]);
}

module.exports = { getSubscriptionsForUser, deleteSubscriptionById };
