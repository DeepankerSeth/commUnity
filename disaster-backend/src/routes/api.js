import express from 'express';
import { fetchDisasterData } from '../services/predictHQservice.js';
import createIncidentReport from './createIncidentReport.js';
import getIncidentUpdates from './getIncidentUpdates.js';
import userLocation from './userLocation.js';

const router = express.Router();

// API endpoint to fetch disaster data
router.get('/disaster-data', async (req, res) => {
  try {
    const data = await fetchDisasterData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching disaster data' });
  }
});

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

export default router;