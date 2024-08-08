import express from 'express';
import { getIncidents, createIncident, updateIncident, deleteIncident } from '../controllers/apiIntegrationController.js';
import { authenticateApiKey } from '../middleware/apiAuth.js';

const router = express.Router();

// Apply API key authentication middleware to all routes
router.use(authenticateApiKey);

router.get('/incidents', getIncidents);
router.post('/incidents', createIncident);
router.put('/incidents/:id', updateIncident);
router.delete('/incidents/:id', deleteIncident);

export default router;
