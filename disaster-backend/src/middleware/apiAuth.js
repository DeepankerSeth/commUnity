import ApiKey from '../models/apiKey.js';

export const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }

  try {
    const keyDoc = await ApiKey.findOne({ key: apiKey });
    if (!keyDoc || !keyDoc.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive API key' });
    }
    req.apiKeyOwner = keyDoc.owner;
    next();
  } catch (error) {
    console.error('Error authenticating API key:', error);
    res.status(500).json({ error: 'An error occurred while authenticating' });
  }
};
