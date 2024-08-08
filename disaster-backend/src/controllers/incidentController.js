import { createIncidentReport, processIncident, updateMetadataWithFeedback } from '../ai/llmProcessor.js';
import { checkSimilarIncidentsAndNotify } from '../services/notificationService.js';
import { Storage } from '@google-cloud/storage';
import { emitIncidentUpdate, emitNewIncident } from '../services/socketService.js';
import { analyzeTrends, getPredictiveModel } from '../services/trendAnalysisService.js';
import { getHeatmapData, getTimeSeriesData } from '../services/visualizationService.js';

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
    incidentReport.metadata = analysis.metadata;
    await incidentReport.save();

    // Emit new incident event
    emitNewIncident(incidentReport);

    // Check for similar incidents and send notifications if necessary
    await checkSimilarIncidentsAndNotify(incidentReport);

    res.status(201).json({ 
      message: 'Incident reported and analyzed successfully', 
      incidentId: incidentReport._id,
      analysis: analysis.analysis,
      severity: analysis.severity,
      impactRadius: analysis.impactRadius,
      metadata: analysis.metadata
    });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'An error occurred while creating the incident report' });
  }
}

export async function provideFeedback(req, res) {
  try {
    const { incidentId } = req.params;
    const { feedback } = req.body;

    const updatedIncident = await updateMetadataWithFeedback(incidentId, feedback);

    // Process feedback for LLM fine-tuning
    await processFeedback(incidentId, feedback);

    // Emit incident update event
    emitIncidentUpdate(incidentId, {
      description: updatedIncident.description,
      analysis: updatedIncident.analysis,
      severity: updatedIncident.severity,
      impactRadius: updatedIncident.impactRadius,
      metadata: updatedIncident.metadata
    });

    res.status(200).json({
      message: 'Feedback processed and incident metadata updated',
      incident: updatedIncident
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({ error: 'An error occurred while processing feedback' });
  }
}

export const getTrendAnalysis = async (req, res) => {
  try {
    const analysis = await analyzeTrends();
    res.json(analysis);
  } catch (error) {
    console.error('Error performing trend analysis:', error);
    res.status(500).json({ error: 'An error occurred while performing trend analysis' });
  }
};

export const getPredictions = async (req, res) => {
  try {
    const predictions = await getPredictiveModel();
    res.json(predictions);
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).json({ error: 'An error occurred while generating predictions' });
  }
};

export const getVisualizationData = async (req, res) => {
  try {
    const heatmapData = await getHeatmapData();
    const timeSeriesData = await getTimeSeriesData();
    res.json({ heatmapData, timeSeriesData });
  } catch (error) {
    console.error('Error fetching visualization data:', error);
    res.status(500).json({ error: 'An error occurred while fetching visualization data' });
  }
};