function getTimestamp() {
  return new Date().toISOString();
}

function log(message) {
  console.log('[' + getTimestamp() + '] ' + message);
}

function logError(message, error) {
  let detail = String(error);
  if (error && error.message) {
    detail = error.message;
  }
  console.log('[' + getTimestamp() + '] ERROR ' + message + ': ' + detail);
}

module.exports = { log, logError };
