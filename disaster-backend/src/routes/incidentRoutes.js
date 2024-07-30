import express from 'express';
import multer from 'multer';
import { uploadFile } from '../storage/googleCloudStorage.js';
import { createIncidentReport } from '../ai/llmProcessor.js';
import IncidentReport from '../models/incidentReport.js';
import { checkSimilarIncidentsAndNotify } from '../services/notificationService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/report', upload.array('files'), async (req, res) => {
  try {
    const { description, latitude, longitude } = req.body;
    const files = req.files;

    // Upload files to Google Cloud Storage
    const mediaUrls = await Promise.all(files.map(async (file) => {
      const url = await uploadFile(file);
      return url;
    }));

    // Create incident report
    const incidentData = { description, latitude, longitude, mediaUrls };
    const incidentReport = await createIncidentReport(incidentData);

    // Check for similar incidents and send notifications if necessary
    await checkSimilarIncidentsAndNotify(incidentReport);

    res.status(200).json({ message: 'Incident reported successfully', incidentId: incidentReport._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// endpoint to get incidents near a location
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query; // Default max distance to 5km
    const incidents = await IncidentReport.findNearLocation(parseFloat(latitude), parseFloat(longitude), parseInt(maxDistance));
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;