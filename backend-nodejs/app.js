// Purpose: Implement security best practices.
// Load environment variables and connect to the database:

// Improvements:
// Added CORS for cross-origin requests.
// Added comments for clarity.

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors'); // Added CORS for cross-origin requests
const express = require('express');
const connectDB = require('./src/config/db');
const apiGateway = require('./src/routes/apiGateway');
const dashboardRoutes = require('./src/routes/dashboard');
const apiForMobileRoutes = require('./src/routes/apiForMobile');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to database
connectDB();

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

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
