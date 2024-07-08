//Purpose: Handle disaster prediction requests.
// Integrating ML models for various disaster prediction


const { fetchDisasterData } = require('../services/predictHQservice');

// Function to predict disasters
const { fetchDisasterData } = require('../services/predictHQservice');

// Function to predict disasters
const predictDisaster = async (req, res) => {
  try {
    const disasterData = await fetchDisasterData();
    res.json({ disasterData });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching disaster data' });
  }
};

// Export the predictDisaster function
module.exports = { predictDisaster };
