function toMysqlUtcDateTime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function toIsoDateTime(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const dateValue = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
    const date = new Date(dateValue);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return value;
}

module.exports = {
  toMysqlUtcDateTime,
  toIsoDateTime
};
