console.log('Loading incidentRoutes.js');
import express from 'express';
import multer from 'multer';
import { uploadFile } from '../storage/googleCloudStorage.js';
import { getIncidentReport } from '../services/incidentService.js';
import { checkSimilarIncidentsAndNotify } from '../services/notificationService.js';
import { createIncident } from '../controllers/incidentController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.array('mediaFiles', 5), createIncident);


// Fetch a specific incident by ID
router.get('/:incidentId', async (req, res) => {
  try {
    const incident = await getIncidentReport(req.params.incidentId);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.status(200).json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'An error occurred while fetching the incident' });
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