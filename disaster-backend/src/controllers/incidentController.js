import { createIncidentReport, processIncident } from '../ai/llmProcessor';
import { checkSimilarIncidentsAndNotify } from '../services/notificationService';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

export async function createIncident(req, res) {
  try {
    const { userId, type, description, latitude, longitude } = req.body;
    const mediaFiles = req.files;

    // Upload media files to Google Cloud Storage
    const mediaUrls = await Promise.all(mediaFiles.map(async (file) => {
      const blob = bucket.file(`${Date.now()}-${file.originalname}`);
      const blobStream = blob.createWriteStream();

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', () => resolve(blob.publicUrl()));
        blobStream.end(file.buffer);
      });
    }));

    // Create incident report
    const incidentData = { userId, type, description, latitude, longitude, mediaUrls };
    const incidentReport = await createIncidentReport(incidentData);

    // Process the incident
    const analysis = await processIncident(incidentReport);

    // Update the incident report with the analysis
    incidentReport.analysis = analysis.analysis;
    incidentReport.severity = analysis.severity;
    incidentReport.impactRadius = analysis.impactRadius;
    await incidentReport.save();

    // Check for similar incidents and send notifications if necessary
    await checkSimilarIncidentsAndNotify(incidentReport);

    res.status(201).json({ 
      message: 'Incident reported and analyzed successfully', 
      incidentId: incidentReport._id,
      analysis: analysis.analysis,
      severity: analysis.severity,
      impactRadius: analysis.impactRadius
    });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'An error occurred while creating the incident report' });
  }
}