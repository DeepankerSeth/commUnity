console.log('Loading apiIntegrationController.js');
import { getIncidentReport } from '../../services/incidentService.js';
import { processIncident } from '../ai/llmProcessor.js';
import { emitNewIncident, emitIncidentUpdate } from '../services/socketService.js';
import { uploadFile } from '../services/storageService.js';

export const getIncidents = async (req, res) => {
  try {
    const { limit = 10, offset = 0, type, severity, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (severity) query.severity = parseInt(severity);
    if (status) query.status = status;

    const incidents = await getIncidentReport(query)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'An error occurred while fetching incidents' });
  }
};

export const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, latitude, longitude, severity, status } = req.body;

    const incident = await getIncidentReport(id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    incident.type = type || incident.type;
    incident.description = description || incident.description;
    incident.location = latitude && longitude ? {
      type: 'Point',
      coordinates: [longitude, latitude]
    } : incident.location;
    incident.severity = severity || incident.severity;
    incident.status = status || incident.status;

    const analysis = await processIncident(incident);
    incident.analysis = analysis.analysis;
    incident.impactRadius = analysis.impactRadius;

    await incident.save();
    emitIncidentUpdate(incident._id, incident);

    res.json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'An error occurred while updating the incident' });
  }
};

export const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await getIncidentReport(id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ error: 'An error occurred while deleting the incident' });
  }
};