console.log('Loading incidentController.js');

import { runQuery } from '../config/neo4jConfig.js';
import { processIncident } from '../ai/llmProcessor.js';
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
    logger.info('Received incident data:', req.body);
    const { type, description, latitude, longitude } = req.body;
    const mediaFiles = req.files || [];
    const userIP = req.ip;

    // Get IP geolocation
    let ipLocation = await getIPGeolocation(userIP);

    // Handle cases where ipLocation might be undefined or null
    if (!ipLocation || !ipLocation.latitude || !ipLocation.longitude) {
      ipLocation = { latitude: null, longitude: null };
    }

    // Extract ipLatitude and ipLongitude, ensuring they are defined
    const ipLatitude = ipLocation.latitude;
    const ipLongitude = ipLocation.longitude;

    // Process media files (if any)
    const mediaUrls = await Promise.all(mediaFiles.map(async (file) => {
      const blob = bucket.file(`${Date.now()}-${file.originalname}`);
      const blobStream = blob.createWriteStream();
      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', () => resolve(blob.publicUrl()));
        blobStream.end(file.buffer);
      });
    }));

    // Calculate distance (handle null values)
    const distance =
      latitude && longitude && ipLatitude && ipLongitude
        ? calculateDistance(latitude, longitude, ipLatitude, ipLongitude)
        : null;

    const needsReview = distance !== null ? distance > 5 : true;

    const incidentData = {
      type,
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      reporterIP: userIP,
      ipLocation,
      needsReview,
      mediaUrls,
    };

    // Process incident with AI model
    const analysis = await processIncident(incidentData);

    // Create the incident in Neo4j
    const result = await runQuery(`
      CREATE (i:IncidentReport {
        id: randomUUID(),
        type: $type,
        description: $description,
        latitude: $latitude,
        longitude: $longitude,
        mediaUrls: $mediaUrls,
        reporterIP: $reporterIP,
        ipLatitude: $ipLatitude,
        ipLongitude: $ipLongitude,
        needsReview: $needsReview,
        severity: $severity,
        impactRadius: $impactRadius,
        analysis: $analysis,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN i
    `, {
      type,
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      mediaUrls,
      reporterIP: userIP,
      ipLatitude,
      ipLongitude,
      needsReview,
      severity: analysis.severity,
      impactRadius: analysis.impactRadius,
      analysis: analysis.analysis,
      metadata: {
        keywords: analysis.keywords || [],
        incidentName: analysis.incidentName || 'Unnamed Incident',
        placeOfImpact: analysis.placeOfImpact || 'Unknown Location',
        neighborhood: analysis.neighborhood || 'Unknown Neighborhood'
      }
    });

    const createdIncident = result[0].get('i').properties;

    logger.info(`Incident ${createdIncident.id} created successfully`);

    // Emit event to connected clients
    emitNewIncident(createdIncident);

    res.status(201).json({
      message: 'Incident reported successfully',
      incident: createdIncident,
    });
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
    const result = await runQuery(`
      MATCH (i:IncidentReport)
      WHERE point.distance(point({latitude: i.latitude, longitude: i.longitude}), 
                           point({latitude: $latitude, longitude: $longitude})) <= $radius
      RETURN i,
             point.distance(point({latitude: i.latitude, longitude: i.longitude}), 
                            point({latitude: $latitude, longitude: $longitude})) AS distance
      ORDER BY distance
      LIMIT 50
    `, { latitude: parseFloat(latitude), longitude: parseFloat(longitude), radius: parseFloat(radius) });

    const incidents = result.map(record => ({
      ...record.get('i').properties,
      distance: record.get('distance').toNumber()
    }));

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

    const result = await runQuery(`
      MATCH (i:IncidentReport {id: $incidentId})
      SET i.feedback = $feedback, i.updatedAt = datetime()
      RETURN i
    `, { incidentId, feedback });

    const updatedIncident = result[0].get('i').properties;

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