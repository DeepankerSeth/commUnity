// src/services/pnnlRadrService.js
const axios = require('axios');

const fetchRadrData = async () => {
  try {
    const response = await axios.get('https://radr.pnnl.gov/api/data', {
      headers: {
        Authorization: `Bearer ${process.env.PNNL_RADR_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from PNNL RADR:', error);
    throw error;
  }
};

module.exports = { fetchRadrData };

