const nodemailer = require('nodemailer');
const { config } = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter === null) {
    const options = {
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465
    };

    if (config.smtp.user) {
      options.auth = {
        user: config.smtp.user,
        pass: config.smtp.password
      };
    }

    transporter = nodemailer.createTransport(options);
  }
  return transporter;
}

function buildEmailContent(details) {
  const subject =
    'Reminder: "' + details.title + '" is due in ' + details.remainingText;

  const text =
    'Hi ' + details.userName + ',\n\n' +
    'This is a reminder about your assignment.\n\n' +
    'Assignment: ' + details.title + '\n' +
    'Course: ' + details.courseName + ' (' + details.courseCode + ')\n' +
    'Due: ' + details.dueText + '\n' +
    'Time remaining: ' + details.remainingText + '\n\n' +
    'Good luck!\n' +
    'Academic Helper';

  return { subject: subject, text: text };
}

async function sendReminderEmail(details) {
  const content = buildEmailContent(details);

  await getTransporter().sendMail({
    from: config.emailFrom,
    to: details.userEmail,
    subject: content.subject,
    text: content.text
  });
}

function closeEmailService() {
  if (transporter !== null) {
    transporter.close();
  }
}

module.exports = { buildEmailContent, sendReminderEmail, closeEmailService };
