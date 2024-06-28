// src/services/predictHQService.js
const axios = require('axios');

const fetchDisasterData = async () => {
  try {
    const response = await axios.get('https://api.predicthq.com/v1/events/', {
      headers: {
        Authorization: `Bearer ${process.env.PREDICTHQ_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from PredictHQ:', error);
    throw error;
  }
};

module.exports = { fetchDisasterData };