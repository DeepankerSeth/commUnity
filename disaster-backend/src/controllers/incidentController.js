console.log('Loading incidentController.js');
import { processIncident, updateMetadataWithFeedback } from '../ai/llmProcessor.js';
import { checkSimilarIncidentsAndNotify } from '../services/notificationService.js';
import { Storage } from '@google-cloud/storage';
import { emitIncidentUpdate, emitNewIncident } from '../services/socketService.js';
import { analyzeTrends, getPredictiveModel } from '../services/trendAnalysisService.js';
import { getHeatmapData, getTimeSeriesData } from '../services/visualizationService.js';
import { createNewIncidentReportNeo4j, getIncidentReportsNearLocation, updateIncidentReport } from '../services/graphDatabaseService.js';
import { getIPGeolocation, calculateDistance } from '../services/geolocationService.js';
import { createNewIncidentReport } from '../services/incidentService.js';
import { performNaturalLanguageSearch } from '../services/searchService.js';
import { generateAutomatedResponse } from '../services/responseGenerationService.js';
import { analyzeIncidentImage } from '../services/mediaAnalysisService.js';
import { planEvacuationRoutes } from '../services/evacuationService.js';
import { verifyIncidentAutomatically } from '../services/verificationService.js';
import { assessRiskDynamically } from '../services/riskScoringService.js';
import logger from '../utils/logger.js';

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

export const createIncident = async (req, res) => {
  try {
    console.log('Received incident data:', req.body);
    const { type, description, latitude, longitude } = req.body;
    const mediaFiles = req.files || [];
    const userIP = req.ip;

    const ipLocation = await getIPGeolocation(userIP);

    const mediaUrls = await Promise.all(mediaFiles.map(async (file) => {
      const blob = bucket.file(`${Date.now()}-${file.originalname}`);
      const blobStream = blob.createWriteStream();
      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', () => resolve(blob.publicUrl()));
        blobStream.end(file.buffer);
      });
    }));

    const distance = calculateDistance(
      latitude, 
      longitude, 
      ipLocation.latitude, 
      ipLocation.longitude
    );

    const needsReview = distance > 5;

    const incidentData = { 
      type, 
      description, 
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      reporterIP: userIP,
      ipLocation: ipLocation,
      needsReview,
      mediaUrls
    };

    const incidentReport = await createNewIncidentReport(incidentData);

    const analysis = await processIncident(incidentReport);

    const updatedIncident = await updateIncidentReport(incidentReport.id, {
      analysis: analysis.analysis,
      severity: analysis.severity,
      impactRadius: analysis.impactRadius,
      metadata: {
        ...analysis,
        keywords: analysis.keywords || [],
        incidentName: analysis.incidentName || 'Unnamed Incident',
        placeOfImpact: analysis.placeOfImpact || 'Unknown Location',
        neighborhood: analysis.neighborhood || 'Unknown Neighborhood'
      }
    });

    emitNewIncident(updatedIncident);

    await checkSimilarIncidentsAndNotify(updatedIncident);

    res.status(201).json(updatedIncident);
  } catch (error) {
    logger.error('Error creating incident:', error);
    res.status(500).json({ error: 'An error occurred while creating the incident' });
  }
};

export const getTrendAnalysis = async (req, res) => {
  try {
    const analysis = await analyzeTrends();
    res.json(analysis);
  } catch (error) {
    logger.error('Error performing trend analysis:', error);
    res.status(500).json({ error: 'An error occurred while performing trend analysis' });
  }
};

export const getPredictions = async (req, res) => {
  try {
    const predictions = await getPredictiveModel();
    res.json(predictions);
  } catch (error) {
    logger.error('Error generating predictions:', error);
    res.status(500).json({ error: 'An error occurred while generating predictions' });
  }
};

export const getVisualizationData = async (req, res) => {
  try {
    const heatmapData = await getHeatmapData();
    const timeSeriesData = await getTimeSeriesData();
    res.json({ heatmapData, timeSeriesData });
  } catch (error) {
    logger.error('Error fetching visualization data:', error);
    res.status(500).json({ error: 'An error occurred while fetching visualization data' });
  }
};

export const getNearbyIncidents = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10000 } = req.query; // radius in meters, default 10km
    const incidents = await getIncidentReportsNearLocation(parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
    res.json(incidents);
  } catch (error) {
    logger.error('Error fetching nearby incidents:', error);
    res.status(500).json({ error: 'An error occurred while fetching nearby incidents' });
  }
};

export const searchIncidents = async (req, res) => {
  try {
    const { query } = req.query;
    const results = await performNaturalLanguageSearch(query);
    res.json(results);
  } catch (error) {
    logger.error('Error performing natural language search:', error);
    res.status(500).json({ error: 'An error occurred while searching incidents' });
  }
};

export const getAutomatedResponse = async (req, res) => {
  try {
    const { incidentType } = req.params;
    const response = await generateAutomatedResponse(incidentType);
    res.json(response);
  } catch (error) {
    logger.error('Error generating automated response:', error);
    res.status(500).json({ error: 'An error occurred while generating automated response' });
  }
};

export const analyzeIncidentMedia = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const analysis = await analyzeIncidentImage(imageUrl);
    res.json(analysis);
  } catch (error) {
    logger.error('Error analyzing incident media:', error);
    res.status(500).json({ error: 'An error occurred while analyzing incident media' });
  }
};

export const getEvacuationPlan = async (req, res) => {
  try {
    const { incidentLocation, safeZones, populationDensity } = req.body;
    const plan = await planEvacuationRoutes(incidentLocation, safeZones, populationDensity);
    res.json(plan);
  } catch (error) {
    logger.error('Error planning evacuation routes:', error);
    res.status(500).json({ error: 'An error occurred while planning evacuation routes' });
  }
};

export const verifyIncident = async (req, res) => {
  try {
    const { incidentReport } = req.body;
    const verificationResult = await verifyIncidentAutomatically(incidentReport);
    res.json(verificationResult);
  } catch (error) {
    logger.error('Error verifying incident:', error);
    res.status(500).json({ error: 'An error occurred while verifying the incident' });
  }
};

export const assessRisk = async (req, res) => {
  try {
    const { currentIncident, historicalIncidents, realTimeData } = req.body;
    const riskAssessment = await assessRiskDynamically(currentIncident, historicalIncidents, realTimeData);
    res.json(riskAssessment);
  } catch (error) {
    logger.error('Error assessing risk:', error);
    res.status(500).json({ error: 'An error occurred while assessing risk' });
  }
};

export const provideFeedback = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { feedback } = req.body;

    const updatedIncident = await updateIncidentReport(incidentId, {
      feedback: feedback
    });

    emitIncidentUpdate(incidentId, updatedIncident);

    res.status(200).json({
      message: 'Feedback processed and incident metadata updated',
      incident: updatedIncident
    });
  } catch (error) {
    logger.error('Error processing feedback:', error);
    res.status(500).json({ error: 'An error occurred while processing feedback' });
  }
};

export default {
  createIncident,
  getTrendAnalysis,
  getPredictions,
  getVisualizationData,
  getNearbyIncidents,
  searchIncidents,
  getAutomatedResponse,
  analyzeIncidentMedia,
  getEvacuationPlan,
  verifyIncident,
  assessRisk,
  provideFeedback
};