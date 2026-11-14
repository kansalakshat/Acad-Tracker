function formatDueDateIst(dueAt) {
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return formatter.format(dueAt) + ' IST';
}

function pluralize(count, word) {
  if (count === 1) {
    return count + ' ' + word;
  }
  return count + ' ' + word + 's';
}

function formatTimeRemaining(milliseconds) {
  const totalMinutes = Math.floor(milliseconds / 60000);

  if (totalMinutes < 1) {
    return 'less than a minute';
  }

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (days > 0) {
    parts.push(pluralize(days, 'day'));
  }
  if (hours > 0) {
    parts.push(pluralize(hours, 'hour'));
  }
  if (minutes > 0 && days === 0) {
    parts.push(pluralize(minutes, 'minute'));
  }

  return parts.join(', ');
}

module.exports = { formatDueDateIst, formatTimeRemaining };
