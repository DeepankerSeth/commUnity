import IncidentReport from '../models/incidentReport.js';
import { processIncident } from '../ai/llmProcessor.js';
import { emitNewIncident, emitIncidentUpdate } from '../services/socketService.js';

export const getIncidents = async (req, res) => {
  try {
    const { limit = 10, offset = 0, type, severity, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (severity) query.severity = parseInt(severity);
    if (status) query.status = status;

    const incidents = await IncidentReport.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'An error occurred while fetching incidents' });
  }
};

export const createIncident = async (req, res) => {
  try {
    const { type, description, latitude, longitude, severity } = req.body;
    const newIncident = new IncidentReport({
      type,
      description,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      severity,
      status: 'active'
    });

    const analysis = await processIncident(newIncident);
    newIncident.analysis = analysis.analysis;
    newIncident.impactRadius = analysis.impactRadius;

    await newIncident.save();
    emitNewIncident(newIncident);

    res.status(201).json(newIncident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'An error occurred while creating the incident' });
  }
};

export const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, latitude, longitude, severity, status } = req.body;

    const incident = await IncidentReport.findById(id);
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
    const incident = await IncidentReport.findByIdAndDelete(id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ error: 'An error occurred while deleting the incident' });
  }
};
