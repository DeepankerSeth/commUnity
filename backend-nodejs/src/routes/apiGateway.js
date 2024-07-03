//API Gateway
// Purpose: Proxy requests to the disaster service.

// Improvements:
// Added comments for clarity.
// Placeholder for authentication and other middleware.

// src/routes/apiGateway.js
const express = require('express');
const httpProxy = require('express-http-proxy');
const router = express.Router();

// Proxy to disaster service
const disasterServiceProxy = httpProxy('https://disaster-service');

// Middleware to handle requests to /disaster
router.use('/disaster', (req, res, next) => {
  // Authentication and other middleware can be added here
  disasterServiceProxy(req, res, next);
});

// Export the router
module.exports = router;
