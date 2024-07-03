// Creating a user-friendly interface for evacuation instructions

// src/controllers/evacuationController.js
const { optimizeEvacuationRoute } = require('../services/evacuationService');

// Controller function to get evacuation instructions
const getEvacuationInstructions = async (req, res) => {
  const { start, end } = req.body;
  try {
    // Optimize the evacuation route
    const route = await optimizeEvacuationRoute(start, end);
    res.json({ route });
  } catch (error) {
    res.status(500).json({ error: 'Error getting evacuation instructions' });
  }
};

// Export the getEvacuationInstructions function
module.exports = { getEvacuationInstructions };

