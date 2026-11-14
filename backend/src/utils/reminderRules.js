const DEFAULT_HOURS_TEXT = '24,1';
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

function parseReminderHours(text) {
  const parts = String(text).split(',');
  const hoursList = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed === '') {
      continue;
    }

    const number = Number(trimmed);
    if (!Number.isInteger(number) || number <= 0) {
      continue;
    }

    if (!hoursList.includes(number)) {
      hoursList.push(number);
    }
  }

  hoursList.sort(function (a, b) {
    return b - a;
  });

  return hoursList;
}

function getPreferencesFromRow(row) {
  if (row.email_enabled === null || row.email_enabled === undefined) {
    return {
      emailEnabled: true,
      browserEnabled: true,
      hoursList: parseReminderHours(DEFAULT_HOURS_TEXT)
    };
  }

  return {
    emailEnabled: Boolean(row.email_enabled),
    browserEnabled: Boolean(row.browser_enabled),
    hoursList: parseReminderHours(row.remind_before_hours)
  };
}

function getPassedHours(dueAt, now, hoursList) {
  const passedHours = [];

  for (const hours of hoursList) {
    const reminderTime = dueAt.getTime() - hours * MILLISECONDS_PER_HOUR;
    if (now.getTime() >= reminderTime) {
      passedHours.push(hours);
    }
  }

  return passedHours;
}

module.exports = { parseReminderHours, getPreferencesFromRow, getPassedHours };
