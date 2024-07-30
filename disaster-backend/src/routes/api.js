import express from 'express';
import { createIncidentReport, getIncidentUpdates } from '../ai/llmProcessor.js';
import userLocation from './userLocation.js';
import { authenticateUser } from '../middleware/auth.js';

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

export default router;