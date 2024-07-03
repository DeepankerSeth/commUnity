//Purpose: Handle disaster prediction requests.
// Integrating ML models for various disaster prediction

// src/controllers/disasterPredictionController.js
const { createModel } = require('../models/disasterPredictionModel');
const { fetchDisasterData } = require('../services/predictHQservice');

// Function to predict disasters
const predictDisaster = async (req, res) => {
  try {
    const model = createModel();
    const disasterData = await fetchDisasterData();
    const prediction = model.predict(tf.tensor2d(disasterData));
    res.json({ prediction });
  } catch (error) {
    res.status(500).json({ error: 'Error predicting disaster' });
  }
};

// Export the predictDisaster function
module.exports = { predictDisaster };
