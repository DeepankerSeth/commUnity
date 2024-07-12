// Creating customizable alert preferences

// src/controllers/alertPreferencesController.js
import User from '../models/userModel'; // Assuming a User model exists

// Function to update user alert preferences
const updatePreferences = async (req, res) => {
  const { userId, preferences } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { alertPreferences: preferences });
    res.json({ message: 'Preferences updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating preferences' });
  }
};

// Export the updatePreferences function
export { updatePreferences };