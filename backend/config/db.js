const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// CA from env (Vercel) or local ca.pem (dev).
const caFile = path.join(__dirname, '..', 'ca.pem');
const ca = process.env.DB_SSL_CA || (fs.existsSync(caFile) ? fs.readFileSync(caFile, 'utf8') : undefined);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  ssl: process.env.DB_SSL === 'true'
    ? { minVersion: 'TLSv1.2', rejectUnauthorized: true, ...(ca && { ca }) }
    : undefined,
  queueLimit: 0,
  timezone: 'Z',
  dateStrings: ['DATE']
});

pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

module.exports = pool;
