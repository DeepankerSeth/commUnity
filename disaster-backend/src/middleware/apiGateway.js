//API Gateway
// Purpose: Proxy requests to the disaster service.

// Improvements:
// Added comments for clarity.
// Placeholder for authentication and other middleware.

// src/routes/apiGateway.js
const express = require('express');
const httpProxy = require('express-http-proxy');
const router = express.Router();
const { getWeatherData } = require('../services/weatherService');

// API endpoint to fetch weather data
router.get('/weather', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const data = await getWeatherData(lat, lon);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});


// // Proxy to disaster service
// const disasterServiceProxy = httpProxy('https://disaster-service');

// // Middleware to handle requests to /disaster
// router.use('/disaster', (req, res, next) => {
//   // Authentication and other middleware can be added here
//   disasterServiceProxy(req, res, next);
// });

// Export the router
module.exports = router;




