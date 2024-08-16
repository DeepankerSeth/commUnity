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
import dotenv from 'dotenv';
import { monitorIncidents } from './src/workers/monitorIncidents.js';
import userLocationRoutes from './src/routes/userLocation.js';
import { createServer } from 'http';
import { initializeSocketIO } from './src/services/socketService.js';
import searchRoutes from './src/routes/search.js'; // Added import for search routes
import { checkJwt } from './src/middleware/auth0Middleware.js';

const app = express();

dotenv.config();

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
app.use('/api', checkJwt);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/location', userLocationRoutes);
app.use('/api', searchRoutes); // Added route for search

// Global error handler
app.use(errorHandler);

// Start the incident monitoring worker
setInterval(monitorIncidents, 5 * 60 * 1000); // Run every 5 minutes

const server = createServer(app);
initializeSocketIO(server);

server.listen(process.env.PORT || 3001, () => {
  console.log(`Server started on port ${process.env.PORT || 3001}`);
});

export default app;