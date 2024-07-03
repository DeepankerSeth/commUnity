// Setting up a basic REST API for mobile app integration

// src/routes/api.js
const express = require('express');
const router = express.Router();
const { fetchDisasterData } = require('../services/predictHQservice');

// API endpoint to fetch disaster data
router.get('/disaster-data', async (req, res) => {
  try {
    const data = await fetchDisasterData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching disaster data' });
  }
});

// Export the router
module.exports = router;
