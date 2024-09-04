import express from 'express';
import { getIncidentUpdates, getIncidentTimeline } from '../ai/llmProcessor.js';
import userLocation from './userLocation.js';
import { getClusterData } from '../services/clusteringService.js';
import { generateStatistics } from '../services/statisticsService.js';
import { updateIncidentBasedOnFeedback } from '../services/incidentService.js';
import { createIncident, provideFeedback } from '../db/controllers/incidentController.js';
import { searchLocations, getLocationDetails } from '../services/locationService.js';
import { performHybridSearch } from '../services/searchService.js';
import { getIncidentCluster, getIncidentsInArea, getFullIncidentTimeline, getIncidentPropagation } from '../services/advancedQueryService.js';
import { processFeedback } from '../services/feedbackService.js';
import multer from 'multer';
import * as incidentController from '../controllers/incidentController.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Existing routes
router.get('/incidents/:id/updates', async (req, res) => {
  try {
    const incidentId = req.params.id;
    const updates = await getIncidentUpdates(incidentId);
    res.json(updates);
  } catch (error) {
    console.error('Error fetching incident updates:', error);
    res.status(500).json({ error: 'An error occurred while fetching incident updates' });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

router.get('/user-notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort('-createdAt').limit(10);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user notifications' });
  }
});

router.get('/incident-clusters', async (req, res) => {
  try {
    const clusterData = await getClusterData();
    res.json(clusterData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching incident clusters' });
  }
});

router.get('/incidents/:id/timeline', async (req, res) => {
  try {
    const incidentId = req.params.id;
    const timeline = await getIncidentTimeline(incidentId);
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching incident timeline' });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const statistics = await generateStatistics();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: 'Error generating statistics' });
  }
});

router.post('/geofences', async (req, res) => {
  try {
    const geofences = await addGeofence(req.user._id, req.body);
    res.status(201).json(geofences);
  } catch (error) {
    res.status(500).json({ error: 'Error adding geofence' });
  }
});

router.delete('/geofences/:id', async (req, res) => {
  try {
    const geofences = await removeGeofence(req.user._id, req.params.id);
    res.json(geofences);
  } catch (error) {
    res.status(500).json({ error: 'Error removing geofence' });
  }
});

router.put('/geofences/:id', async (req, res) => {
  try {
    const geofence = await updateGeofence(req.user._id, req.params.id, req.body);
    res.json(geofence);
  } catch (error) {
    res.status(500).json({ error: 'Error updating geofence' });
  }
});

router.post('/incidents/:id/feedback', async (req, res) => {
  try {
    const { accuracy, usefulness } = req.body;
    const feedback = await processFeedback({
      incidentId: req.params.id,
      userId: req.user.id,
      accuracy,
      usefulness
    });
    res.json({ message: 'Feedback processed successfully', feedback });
  } catch (error) {
    res.status(500).json({ error: 'Error processing feedback' });
  }
});

router.get('/locations/search', async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;
    const suggestions = await searchLocations(query, userId);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching location suggestions' });
  }
});

router.get('/locations/details', async (req, res) => {
  try {
    const { placeId } = req.query;
    const details = await getLocationDetails(placeId);
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching location details' });
  }
});

// Hybrid search route
router.get('/incidents/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    const results = await performHybridSearch(query, parseInt(limit));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error performing hybrid search' });
  }
});

// Incident cluster route
router.get('/incidents/:id/cluster', async (req, res) => {
  try {
    const cluster = await getIncidentCluster(req.params.id);
    res.json(cluster);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching incident cluster' });
  }
});

// Incidents in area route
router.get('/incidents/area', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const incidents = await getIncidentsInArea(parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching incidents in area' });
  }
});

// Full incident timeline route
router.get('/incidents/:id/timeline', async (req, res) => {
  try {
    const timeline = await getFullIncidentTimeline(req.params.id);
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching incident timeline' });
  }
});

// Incident propagation route
router.get('/incidents/:id/propagation', async (req, res) => {
  try {
    const propagation = await getIncidentPropagation(req.params.id);
    res.json(propagation);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching incident propagation' });
  }
});

// New routes for LangChain-powered features
router.get('/trends', (req, res) => incidentController.getTrendAnalysis(req, res));
router.get('/predictions', (req, res) => incidentController.getPredictions(req, res));
router.get('/visualization', (req, res) => incidentController.getVisualizationData(req, res));
router.get('/nlp-search', (req, res) => incidentController.searchIncidents(req, res));
router.get('/response/:incidentType', (req, res) => incidentController.getAutomatedResponse(req, res));
router.post('/analyze-media', (req, res) => incidentController.analyzeIncidentMedia(req, res));
router.post('/evacuation-plan', (req, res) => incidentController.getEvacuationPlan(req, res));
router.post('/verify-incident', (req, res) => incidentController.verifyIncident(req, res));
router.post('/assess-risk', (req, res) => incidentController.assessRisk(req, res));

router.get('/incidents/nearby', (req, res) => incidentController.getNearbyIncidents(req, res));

export default router;