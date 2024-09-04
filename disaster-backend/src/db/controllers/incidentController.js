console.log('Loading incidentController.js');
import { Storage } from '@google-cloud/storage';
import { processIncident } from '../../ai/llmProcessor.js';
import { createNewIncidentReport } from '../../services/incidentService.js';
import { checkSimilarIncidentsAndNotify } from '../../services/notificationService.js';
import { emitIncidentUpdate, emitNewIncident } from '../../services/socketService.js';
import { analyzeTrends, getPredictiveModel } from '../../services/trendAnalysisService.js';
import { getHeatmapData, getTimeSeriesData } from '../../services/visualizationService.js';
import { performNaturalLanguageSearch } from '../../services/searchService.js';
import { generateAutomatedResponse } from '../../services/responseGenerationService.js';
import { analyzeIncidentImage } from '../../services/mediaAnalysisService.js';
import { planEvacuationRoutes } from '../../services/evacuationService.js';
import { verifyIncidentAutomatically } from '../../services/verificationService.js';
import { assessRiskDynamically } from '../../services/riskScoringService.js';
import logger from '../../utils/logger.js';

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

export const createIncident = async (req, res) => {
  try {
    console.log('Received incident data:', req.body);
    const { type, description, latitude, longitude } = req.body;
    const mediaFiles = req.files || [];

    let location;
    if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
      location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

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

    const incidentData = { type, description, location, mediaUrls };
    const incidentReport = await createNewIncidentReport(incidentData);

    // Process the incident
    const analysis = await processIncident(incidentReport);

    // Update the incident report with the analysis
    incidentReport.analysis = analysis.analysis;
    incidentReport.severity = analysis.severity;
    incidentReport.impactRadius = analysis.impactRadius;
    incidentReport.metadata = analysis.metadata;
    incidentReport.immediateRisks = analysis.immediateRisks;
    incidentReport.recommendedActions = analysis.recommendedActions;

    // Store in Neo4j
    const createdIncident = await createNewIncidentReport(incidentReport);
    await incidentReport.save();

    // Emit new incident after successful creation
    emitNewIncident(incidentReport);
    await checkSimilarIncidentsAndNotify(incidentReport);

    res.status(201).json(incidentReport);
  } catch (error) {
    logger.error('Error creating incident:', error);
    res.status(500).json({ error: 'An error occurred while creating the incident' });
  }
};

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
    logger.error('Error processing feedback:', error);
    res.status(500).json({ error: 'An error occurred while processing feedback' });
  }
}

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