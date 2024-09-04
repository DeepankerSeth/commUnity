console.log('Loading incidentController.js');
import { processIncident, updateMetadataWithFeedback } from '../ai/llmProcessor.js';
import { checkSimilarIncidentsAndNotify } from '../services/notificationService.js';
import { Storage } from '@google-cloud/storage';
import { emitIncidentUpdate, emitNewIncident } from '../services/socketService.js';
import { analyzeTrends, getPredictiveModel } from '../services/trendAnalysisService.js';
import { getHeatmapData, getTimeSeriesData } from '../services/visualizationService.js';
import { createNewIncidentReportNeo4j, getIncidentReportsNearLocation } from '../services/graphDatabaseService.js';
import { getIPGeolocation, calculateDistance } from '../services/geolocationService.js';
import { createNewIncidentReport } from '../services/incidentService.js';
import logger from '../utils/logger.js';

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

export const createIncident = async (req, res) => {
  try {
    console.log('Received incident data:', req.body);
    const { type, description, latitude, longitude } = req.body;
    const mediaFiles = req.files || [];
    const userIP = req.ip;

    // Get user's IP-based location
    const ipLocation = await getIPGeolocation(userIP);

    // Upload media files to Google Cloud Storage
    const mediaUrls = await Promise.all(mediaFiles.map
      (async (file) => {
        const blob = bucket.file(`${Date.now()}-${file.
        originalname}`);
        const blobStream = blob.createWriteStream();  

    // Calculate distance between reported location and IP-based location
    const distance = calculateDistance(
      latitude, 
      longitude, 
      ipLocation.latitude, 
      ipLocation.longitude
    );

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => reject(err));
      blobStream.on('finish', () => resolve(blob.
      publicUrl()));
      blobStream.end(file.buffer);
    });
  }));

    // If the distance is more than 5km, flag the report for review
    const needsReview = distance > 5;

    const incidentData = { 
      type, 
      description, 
      latitude: parseFloat(latitude), 
      longitude: parseFloat(longitude), 
      reporterIP: userIP,
      ipLatitude: ipLocation.latitude,
      ipLongitude: ipLocation.longitude,
      needsReview,
      mediaUrls
    };

    const incidentReport = await createNewIncidentReportNeo4j(incidentData);

    // Process the incident
    const analysis = await processIncident(incidentReport);

    // Update the incident report with the analysis
    incidentReport.analysis = analysis.analysis;
    incidentReport.severity = analysis.severity;
    incidentReport.impactRadius = analysis.impactRadius;
    incidentReport.metadata = analysis.metadata;

    await updateIncidentReport(incidentReport.id, {
      analysis: analysis.analysis,
      severity: analysis.severity,
      impactRadius: analysis.impactRadius,
      metadata: analysis.metadata
    });

    // Emit new incident event
    emitNewIncident(incidentReport);

    // Check for similar incidents and send notifications if necessary
    await checkSimilarIncidentsAndNotify(incidentReport);

    res.status(201).json(incidentReport);
  } catch (error) {
    logger.error('Error creating incident:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'An error occurred while creating the incident' });
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

export const getNearbyIncidents = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10000 } = req.query; // radius in meters, default 10km
    const incidents = await getIncidentReportsNearLocation(latitude, longitude, radius);
    res.json(incidents);
  } catch (error) {
    logger.error('Error fetching nearby incidents:', error);
    res.status(500).json({ error: 'An error occurred while fetching nearby incidents' });
  }
};