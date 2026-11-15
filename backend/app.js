const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
// Comma-separated list, e.g. "https://acad-tracker-h92h.vercel.app,http://localhost:5173"
const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

// On Vercel every request arrives through its proxy; trust it so req.ip is the real client.
if (process.env.VERCEL) {
  app.set('trust proxy', 1);
}

app.use(cors({
  origin: clientOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Academic Helper API is running.',
    data: { status: 'ok' }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/timetable', timetableRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
