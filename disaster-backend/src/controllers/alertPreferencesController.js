// Creating customizable alert preferences

// src/controllers/alertPreferencesController.js
import { getUserFromAuth0, updateUserInAuth0 } from '../services/auth0Service.js';

const updatePreferences = async (req, res) => {
  try {
    const auth0Id = req.user.sub;
    const { preferences } = req.body;
    const user = await getUserFromAuth0(auth0Id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await updateUserInAuth0(auth0Id, { alertPreferences: preferences });
    res.json({ message: 'Preferences updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Error updating preferences' });
  }
};

export { updatePreferences };