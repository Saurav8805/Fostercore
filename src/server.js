const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const studentsRoutes = require('./routes/students.routes');
const staffRoutes = require('./routes/staff.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const feesRoutes = require('./routes/fees.routes');
const progressRoutes = require('./routes/progress.routes');
const behaviourRoutes = require('./routes/behaviour.routes');
const homeworkRoutes = require('./routes/homework.routes');
const eventsRoutes = require('./routes/events.routes');
const galleryRoutes = require('./routes/gallery.routes');
const usersRoutes = require('./routes/users.routes');
const configRoutes = require('./routes/config.routes');

// Import middleware
const errorMiddleware = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Request logging

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fostercore API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/behaviour', behaviourRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/config', configRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fostercore API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
