const webpush = require('web-push');
const { config } = require('../config/env');
const { deleteSubscriptionById } = require('../db/pushSubscriptionQueries');
const { log, logError } = require('../utils/logger');

let isConfigured = false;

function setupWebPush() {
  if (!isConfigured) {
    webpush.setVapidDetails(
      config.vapid.subject,
      config.vapid.publicKey,
      config.vapid.privateKey
    );
    isConfigured = true;
  }
}

function buildPushPayload(details) {
  return {
    title: 'Assignment due soon: ' + details.title,
    body:
      details.courseCode + ' - due ' + details.dueText +
      ' (' + details.remainingText + ' left)',
    assignmentId: details.assignmentId
  };
}

async function sendPushToSubscriptions(subscriptions, payload) {
  setupWebPush();

  const payloadText = JSON.stringify(payload);
  let successCount = 0;

  for (const subscription of subscriptions) {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };

    try {
      await webpush.sendNotification(pushSubscription, payloadText);
      successCount = successCount + 1;
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await deleteSubscriptionById(subscription.id);
        log('Deleted expired push subscription ' + subscription.id);
      } else {
        logError('Push failed for subscription ' + subscription.id, error);
      }
    }
  }

  return successCount;
}

module.exports = { buildPushPayload, sendPushToSubscriptions };
