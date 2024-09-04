// Purpose: Implement security best practices.
// Load environment variables and connect to the database:

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors'; // Added CORS for cross-origin requests
import connectDB from './src/db/mongodb.js';
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
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// console.log('__dirname:', __dirname);

// dotenv.config({ path: path.join(__dirname, '.env') });

app.use(express.json());

// Security middleware
app.use(helmet()); // Protects against well-known vulnerabilities
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Enables CORS for all routes


// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Use routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/location', userLocationRoutes);
app.use('/api', searchRoutes); // Added route for search

// Global error handler
app.use(errorHandler);

// Start the incident monitoring worker
setInterval(monitorIncidents, 5 * 60 * 1000); // Run every 5 minutes

export default app;