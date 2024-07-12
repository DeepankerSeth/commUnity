import { createIncidentReport } from '../ai/llmProcessor';
import { uploadFile } from '../services/storageService';

async function createIncident(req, res) {
  try {
    const file = req.file; // Assuming you use multer for file uploads
    const metadata = req.body;

    // Upload file to Google Cloud Storage
    const fileUrl = await uploadFile(file);

    // Create incident report
    const incidentData = { ...metadata, mediaUrls: [fileUrl] };
    const incident = await createIncidentReport(incidentData);

    res.status(201).json(incident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
}

export { createIncident };