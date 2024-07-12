const express = require('express');
const { uploadFile } = require('../storage/googleCloudStorage');
const { createIncidentReport } = require('../ai/llmProcessor');

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

module.exports = router;