require('dotenv').config();

const config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD
  },
  emailFrom: process.env.EMAIL_FROM,
  vapid: {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    subject: process.env.VAPID_SUBJECT
  },
  cronSchedule: process.env.CRON_SCHEDULE || '* * * * *',
  dryRun: String(process.env.DRY_RUN).toLowerCase() === 'true'
};

function checkRequiredSettings() {
  const missing = [];

  if (!config.db.user) missing.push('DB_USER');
  if (!config.db.database) missing.push('DB_NAME');

  if (!config.dryRun) {
    if (!config.smtp.host) missing.push('SMTP_HOST');
    if (!config.emailFrom) missing.push('EMAIL_FROM');
    if (!config.vapid.publicKey) missing.push('VAPID_PUBLIC_KEY');
    if (!config.vapid.privateKey) missing.push('VAPID_PRIVATE_KEY');
    if (!config.vapid.subject) missing.push('VAPID_SUBJECT');
  }

  if (missing.length > 0) {
    throw new Error('Missing values in .env: ' + missing.join(', '));
  }
}

module.exports = { config, checkRequiredSettings };
