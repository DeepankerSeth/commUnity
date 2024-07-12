// Purpose: Get evacuation routes.
// Integrating mapping services for route planning

// Improvements:
// Integrated with Google Maps API.

// src/services/mappingService.js
const axios = require('axios');

// Function to get evacuation route from a mapping API
const getEvacuationRoute = async (start, end) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${end}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    return response.data.routes[0];
  } catch (error) {
    console.error('Error fetching evacuation route:', error);
    throw error;
  }
};

// Export the getEvacuationRoute function
module.exports = { getEvacuationRoute };

