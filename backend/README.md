# Academic Helper API

Express and MySQL REST API for the Academic Helper React frontend.

## Requirements

- Node.js 18 or newer
- MySQL 8 or a compatible MySQL server
- The React frontend running at the origin configured by `CLIENT_ORIGIN`

## Install

1. Open a terminal in this folder.
2. Run `npm install`.
3. Create a MySQL database named `academic_helper`, or choose another name for `DB_NAME`.
4. Run the SQL in `schema.sql` against that database.
5. Copy `.env.example` to `.env`.
6. Set the database values and replace `JWT_SECRET` with a long random value.
7. Set `CLIENT_ORIGIN` to the React development origin, normally `http://localhost:5173`.
8. Add the VAPID public key used by the worker to `VAPID_PUBLIC_KEY`.
9. Run `npm run dev` for development or `npm start` to start the server.

Already created the database from an older `schema.sql`? Run `sql/migrate_001_frontend_fields.sql` once instead of re-running the schema.

To check every endpoint the frontend uses, start the API and run `node smoke-test.js`.

Run the reminder worker separately with `npm run worker`.

The API listens on port 4000 by default. The health endpoint is `GET http://localhost:4000/api/health`.

## Authentication

Register and login return a JWT. Send it on protected requests with this header:

`Authorization: Bearer YOUR_TOKEN`

The token is not stored by this server. The React application should store it using the frontend team's chosen secure approach and attach it to API requests.

## Date and time handling

Send assignment `due_at` values as ISO 8601 date-time strings with a timezone, for example `2026-11-23T10:30:00+05:30`. The API converts them to UTC before writing to MySQL and returns ISO 8601 UTC strings. Attendance `class_date` values use `YYYY-MM-DD` because the database column is a MySQL `DATE`.

The MySQL pool uses timezone `Z`, and each new connection sets its MySQL session timezone to UTC.

## Reminder worker

This API only stores push subscriptions and exposes `VAPID_PUBLIC_KEY`. It does not send email or browser pushes. The separate worker must use the matching VAPID key pair and the same MySQL schema. Keep the VAPID private key in the worker's environment only; do not place it in this server's environment or expose it to the browser.

`remind_before_hours` is sent to and returned by this API as an array of positive integers. The database stores the same values as a comma-separated string.
