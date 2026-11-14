const { config } = require('../config/env');
const { getPendingAssignmentsBatch } = require('../db/assignmentQueries');
const { getLogsForAssignment, insertReminderLog } = require('../db/reminderLogQueries');
const { getSubscriptionsForUser } = require('../db/pushSubscriptionQueries');
const { buildEmailContent, sendReminderEmail } = require('../services/emailService');
const { buildPushPayload, sendPushToSubscriptions } = require('../services/pushService');
const { getPreferencesFromRow, getPassedHours } = require('../utils/reminderRules');
const { formatDueDateIst, formatTimeRemaining } = require('../utils/timeUtils');
const { log, logError } = require('../utils/logger');

const BATCH_SIZE = 50;

let jobIsRunning = false;
let stopRequested = false;

function isJobRunning() {
  return jobIsRunning;
}

function requestStop() {
  stopRequested = true;
}

function wasAlreadyLogged(loggedReminders, channel, hoursBefore) {
  for (const entry of loggedReminders) {
    if (entry.channel === channel && entry.hours_before === hoursBefore) {
      return true;
    }
  }
  return false;
}

function buildDetails(row, dueAt, now) {
  return {
    assignmentId: row.assignment_id,
    userEmail: row.user_email,
    userName: row.user_name,
    title: row.title,
    courseName: row.course_name,
    courseCode: row.course_code,
    dueText: formatDueDateIst(dueAt),
    remainingText: formatTimeRemaining(dueAt.getTime() - now.getTime())
  };
}

async function recordSkippedReminder(channel, row, hoursBefore) {
  if (config.dryRun) {
    log(
      '[DRY RUN] Would record the ' + hoursBefore + 'h ' + channel +
      ' reminder for assignment ' + row.assignment_id + ' as skipped (not sent)'
    );
    return;
  }

  await insertReminderLog(row.assignment_id, row.user_id, channel, hoursBefore);
  log(
    'Skipped the ' + hoursBefore + 'h ' + channel +
    ' reminder for assignment ' + row.assignment_id + ' (newer reminder is due)'
  );
}

async function sendEmailReminder(details) {
  if (config.dryRun) {
    const content = buildEmailContent(details);
    log(
      '[DRY RUN] Would send email to ' + details.userEmail +
      ' | Subject: ' + content.subject
    );
    return false;
  }

  await sendReminderEmail(details);
  return true;
}

async function sendBrowserReminder(details, subscriptions) {
  const payload = buildPushPayload(details);

  if (config.dryRun) {
    log(
      '[DRY RUN] Would send push to ' + subscriptions.length +
      ' subscription(s) of user ' + details.userEmail +
      ' | Payload: ' + JSON.stringify(payload)
    );
    return false;
  }

  const successCount = await sendPushToSubscriptions(subscriptions, payload);
  if (successCount === 0) {
    log('No push was delivered for assignment ' + details.assignmentId);
    return false;
  }
  return true;
}

async function handleChannel(channel, row, passedHours, loggedReminders, details, subscriptions) {
  const smallestHours = passedHours[passedHours.length - 1];
  const largerHoursList = passedHours.slice(0, passedHours.length - 1);

  for (const hours of largerHoursList) {
    if (!wasAlreadyLogged(loggedReminders, channel, hours)) {
      await recordSkippedReminder(channel, row, hours);
    }
  }

  if (wasAlreadyLogged(loggedReminders, channel, smallestHours)) {
    return;
  }

  let wasSent = false;
  if (channel === 'email') {
    wasSent = await sendEmailReminder(details);
  } else {
    wasSent = await sendBrowserReminder(details, subscriptions);
  }

  if (wasSent) {
    await insertReminderLog(row.assignment_id, row.user_id, channel, smallestHours);
    log(
      'Sent ' + smallestHours + 'h ' + channel + ' reminder for assignment ' +
      row.assignment_id + ' to ' + row.user_email
    );
  }
}

async function processAssignment(row, now) {
  const preferences = getPreferencesFromRow(row);

  if (!preferences.emailEnabled && !preferences.browserEnabled) {
    return;
  }

  const dueAt = new Date(row.due_at);
  const passedHours = getPassedHours(dueAt, now, preferences.hoursList);

  if (passedHours.length === 0) {
    return;
  }

  const loggedReminders = await getLogsForAssignment(row.assignment_id);
  const details = buildDetails(row, dueAt, now);

  if (preferences.emailEnabled) {
    try {
      await handleChannel('email', row, passedHours, loggedReminders, details, []);
    } catch (error) {
      logError('Email reminder failed for assignment ' + row.assignment_id, error);
    }
  }

  if (preferences.browserEnabled) {
    try {
      const subscriptions = await getSubscriptionsForUser(row.user_id);
      if (subscriptions.length > 0) {
        await handleChannel('browser', row, passedHours, loggedReminders, details, subscriptions);
      }
    } catch (error) {
      logError('Browser reminder failed for assignment ' + row.assignment_id, error);
    }
  }
}

async function runReminderJob() {
  if (jobIsRunning) {
    log('Previous run is still in progress, skipping this run');
    return;
  }

  jobIsRunning = true;

  try {
    log('Reminder job started');
    let lastId = 0;
    let checkedCount = 0;

    while (!stopRequested) {
      const now = new Date();
      const rows = await getPendingAssignmentsBatch(now, lastId, BATCH_SIZE);

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        try {
          await processAssignment(row, now);
        } catch (error) {
          logError('Assignment ' + row.assignment_id + ' failed', error);
        }
        checkedCount = checkedCount + 1;
      }

      lastId = rows[rows.length - 1].assignment_id;
    }

    log('Reminder job finished, checked ' + checkedCount + ' assignment(s)');
  } catch (error) {
    logError('Reminder job failed', error);
  } finally {
    jobIsRunning = false;
  }
}

module.exports = { runReminderJob, requestStop, isJobRunning };
