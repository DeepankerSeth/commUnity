//Purpose: Handle disaster prediction requests.
// Integrating ML models for various disaster prediction


import { fetchDisasterData } from '../services/predictHQservice';

// Function to predict disasters
const predictDisaster = async (req, res, next) => {
  try {
    const disasterData = await fetchDisasterData();
    res.json({ disasterData });
  } catch (error) {
    next(error);
  }
};

// Export the predictDisaster function
export { predictDisaster };