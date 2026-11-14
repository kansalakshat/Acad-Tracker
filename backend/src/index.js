const cron = require('node-cron');
const { config, checkRequiredSettings } = require('./config/env');
const pool = require('./config/database');
const { runReminderJob, requestStop, isJobRunning } = require('./jobs/reminderJob');
const { closeEmailService } = require('./services/emailService');
const { log, logError } = require('./utils/logger');

let cronTask = null;
let isShuttingDown = false;

function wait(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}

async function shutdown(signalName) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  log('Received ' + signalName + ', shutting down');

  if (cronTask !== null) {
    cronTask.stop();
  }

  requestStop();

  let waitedSeconds = 0;
  while (isJobRunning() && waitedSeconds < 30) {
    await wait(1000);
    waitedSeconds = waitedSeconds + 1;
  }

  closeEmailService();

  try {
    await pool.end();
  } catch (error) {
    logError('Could not close the database pool', error);
  }

  log('Shutdown complete');
  process.exit(0);
}

async function start() {
  checkRequiredSettings();

  if (!cron.validate(config.cronSchedule)) {
    throw new Error('CRON_SCHEDULE is not a valid cron expression: ' + config.cronSchedule);
  }

  await pool.query('SELECT 1');

  log('Worker started. Schedule: "' + config.cronSchedule + '", dry run: ' + config.dryRun);

  cronTask = cron.schedule(config.cronSchedule, runReminderJob);

  await runReminderJob();
}

process.on('unhandledRejection', function (reason) {
  logError('Unhandled promise rejection', reason);
});

process.on('SIGINT', function () {
  shutdown('SIGINT');
});

process.on('SIGTERM', function () {
  shutdown('SIGTERM');
});

start().catch(function (error) {
  logError('Worker failed to start', error);
  process.exit(1);
});
