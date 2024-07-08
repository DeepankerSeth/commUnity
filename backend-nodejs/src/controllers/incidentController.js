const { storeIncident } = require('../services/incidentService');

async function createIncident(req, res) {
  try {
    const file = req.file; // Assuming you use multer for file uploads
    const metadata = req.body;
    const incident = await storeIncident(file, metadata);
    res.status(201).json(incident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
}

module.exports = { createIncident };
