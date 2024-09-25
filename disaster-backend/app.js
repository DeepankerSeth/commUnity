// Purpose: Implement security best practices.
// Load environment variables and connect to the database:

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import logger from './src/utils/logger.js';
import { checkEnv } from './checkEnv.js';
import apiGateway from './src/middleware/apiGateway.js';
import dashboardRoutes from './src/routes/dashboard.js';
import apiForMobileRoutes from './src/routes/api.js';
import incidentRoutes from './src/routes/incidentRoutes.js';
import errorHandler from './src/middleware/errorHandler.js';
import { monitorIncidents } from './src/workers/monitorIncidents.js';
import searchRoutes from './src/routes/search.js';
import userLocationRoutes from './src/routes/userLocation.js';
import { createServer } from 'http';
import { initializeSocketIO } from './src/services/socketService.js';
import { getServerPort } from './src/utils/serverInfo.js';

dotenv.config();

const app = express();

app.use(express.json());

// Security middleware
app.use(helmet()); // Protects against well-known vulnerabilities
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Use routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/location', userLocationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', apiForMobileRoutes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

// Error logging
app.use((err, req, res, next) => {
  logger.error(err.stack);
  next(err);
});

// Start the incident monitoring worker
setInterval(monitorIncidents, 5 * 60 * 1000); // Run every 5 minutes

app.use(errorHandler);

export default app;