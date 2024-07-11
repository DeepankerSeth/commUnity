// Purpose: Fetch data from PredictHQ API.

// src/services/predictHQService.js
const axios = require('axios');
const NodeCache = require('node-cache'); // Added caching

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Function to fetch disaster data from PredictHQ
const fetchDisasterData = async () => {
  const cacheKey = 'disasterData';
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData; // Return cached data if available
  }

  try {
    const response = await axios.get('https://api.predicthq.com/v1/events/', {
      headers: {
        Authorization: `Bearer ${process.env.PREDICTHQ_API_KEY}`,
      },
    });
    cache.set(cacheKey, response.data); // Cache the response data
    return response.data;
  } catch (error) {
    console.error('Error fetching data from PredictHQ:', error);
    throw error;
  }
};

// Export the fetchDisasterData function
module.exports = { fetchDisasterData };
