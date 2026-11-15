require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

const port = Number(process.env.PORT || 4000);

async function startServer() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required.');
  }

  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    throw new Error('Database environment variables are required.');
  }

  await pool.query('SELECT 1');

  app.listen(port, () => {
    process.stdout.write(`Academic Helper API listening on port ${port}\n`);
  });
}

startServer().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
