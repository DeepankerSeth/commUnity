import express from 'express';
import { uploadFile } from '../storage/googleCloudStorage.js';
import { createIncidentReport } from '../ai/llmProcessor.js';
import IncidentReport from '../models/incidentReport.js';

const router = express.Router();

router.post('/report', async (req, res) => {
  try {
    const { userId, type, description, latitude, longitude, images } = req.body;

    // Upload images to Google Cloud Storage
    const imageUrls = await Promise.all(images.map(async (imagePath) => {
      await uploadFile(imagePath);
      return `gs://your-bucket-name/${imagePath}`;
    }));

    // Create incident report
    const incidentData = { userId, type, description, latitude, longitude, mediaUrls: imageUrls };
    const incidentReport = await createIncidentReport(incidentData);

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