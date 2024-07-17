// Purpose: Implement security best practices.
// Load environment variables and connect to the database:

// Improvements:
// Added CORS for cross-origin requests.
// Added comments for clarity.

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors'; // Added CORS for cross-origin requests
import express from 'express';
import connectDB from './src/db/mongodb.js';
import apiGateway from './src/middleware/apiGateway.js';
import dashboardRoutes from './src/routes/dashboard.js';
import apiForMobileRoutes from './src/routes/api.js';
import incidentRoutes from './src/routes/incidentRoutes.js';
import errorHandler from './src/middleware/errorHandler.js';
import dotenv from 'dotenv';
import { monitorIncidents } from './src/workers/monitorIncidents.js';
import evacuationRoutes from './src/routes/evacuationRoutes.js';
import alertPreferencesRoutes from './src/routes/alertPreferencesRoutes.js';
import disasterPredictionRoutes from './src/routes/disasterPredictionRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to database
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

app.use(bodyParser.json());
app.use('/incidents', incidentRoutes);

// Security middleware
app.use(helmet()); // Protects against well-known vulnerabilities
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
app.use('/api', apiGateway);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/evacuation', evacuationRoutes);
app.use('/api/alert-preferences', alertPreferencesRoutes);
app.use('/api/disaster-data', disasterPredictionRoutes);

// Global error handler
app.use(errorHandler);

// Start the incident monitoring worker
monitorIncidents();

export default app;