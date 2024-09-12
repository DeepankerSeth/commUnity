// Creating a user-friendly interface for evacuation instructions

// src/controllers/evacuationController.js
console.log('Loading evacuationController.js');
import { optimizeEvacuationRoute } from '../../services/evacuationService';

// Controller function to get evacuation instructions
const getEvacuationInstructions = async (req, res, next) => {
  const { start, end } = req.body;
  try {
    // Optimize the evacuation route
    const route = await optimizeEvacuationRoute(start, end);
    res.json({ route });
  } catch (error) {
    next(error);
  }
};

// Export the getEvacuationInstructions function
export { getEvacuationInstructions };