// Purpose: Implement security best practices.
// Load environment variables and connect to the database:

// Improvements:
// Added CORS for cross-origin requests.
// Added comments for clarity.

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cors = require('cors'); // Added CORS for cross-origin requests
const express = require('express');
const connectDB = require('./src/db/mongodb');
const apiGateway = require('./src/middleware/apiGateway');
const dashboardRoutes = require('./src/routes/dashboard');
const apiForMobileRoutes = require('./src/routes/apiForMobile');
const incidentRoutes = require('./src/routes/incidentRoutes');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

// Import the monitorIncidents function
const { monitorIncidents } = require('./src/workers/monitorIncidents');

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
app.use(cors()); // Enables CORS for all routes

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
app.use('/dashboard', dashboardRoutes);
app.use('/apiForMobile', apiForMobileRoutes);

// Global error handler
app.use(errorHandler);

// Start the incident monitoring worker
monitorIncidents();

module.exports = app;