import express from 'express';
import { createIncidentReport, getIncidentUpdates, getIncidentTimeline } from '../ai/llmProcessor.js';
import userLocation from './userLocation.js';
import { authenticateUser } from '../middleware/auth.js';
import { getClusterData } from '../services/clusteringService.js';
import { generateStatistics } from '../services/statisticsService.js';
import { addGeofence, removeGeofence, updateGeofence } from '../services/geofencingService.js';

const router = express.Router();

router.post('/incidents', async (req, res) => {
  try {
    const incidentData = req.body;
    const incident = await createIncidentReport(incidentData);
    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ error: 'Error creating incident report' });
  }
});

router.get('/incidents/:id/updates', async (req, res) => {
  try {
    const incidentId = req.params.id;
    const updates = await getIncidentUpdates(incidentId);
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching incident updates' });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    // TODO: Implement user authentication and fetch notifications for the authenticated user
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

router.get('/user-notifications', authenticateUser, async (req, res) => {
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

router.post('/geofences', authenticateUser, async (req, res) => {
  try {
    const geofences = await addGeofence(req.user._id, req.body);
    res.status(201).json(geofences);
  } catch (error) {
    res.status(500).json({ error: 'Error adding geofence' });
  }
});

router.delete('/geofences/:id', authenticateUser, async (req, res) => {
  try {
    const geofences = await removeGeofence(req.user._id, req.params.id);
    res.json(geofences);
  } catch (error) {
    res.status(500).json({ error: 'Error removing geofence' });
  }
});

router.put('/geofences/:id', authenticateUser, async (req, res) => {
  try {
    const geofence = await updateGeofence(req.user._id, req.params.id, req.body);
    res.json(geofence);
  } catch (error) {
    res.status(500).json({ error: 'Error updating geofence' });
  }
});

router.post('/incidents/:id/feedback', authenticateUser, async (req, res) => {
  try {
    const { accuracy, usefulness } = req.body;
    await updateIncidentBasedOnFeedback(req.params.id, accuracy, usefulness);
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting feedback' });
  }
});

export default router;