console.log('Loading incidentRoutes.js');
import express from 'express';
import multer from 'multer';
import { uploadFile } from '../storage/googleCloudStorage.js';
import { createNewIncidentReport } from '../services/incidentService.js';
import { checkSimilarIncidentsAndNotify } from '../services/notificationService.js';
import { createIncident } from '../db/controllers/incidentController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.array('mediaFiles', 5), createIncident);

router.get('/', async (req, res) => {
  try {
    const incidents = await getIncidentReportsNeo4j();
    res.status(200).json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'An error occurred while fetching incidents' });
  }
});

// endpoint to get incidents near a location
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query; // Default max distance to 5km
    const incidents = await getIncidentReportsNearLocation(parseFloat(latitude), parseFloat(longitude), parseInt(maxDistance));
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;