import {
  getRelatedIncidents,
  getIncidentsByLocation,
  getIncidentTimeline
} from './graphDatabaseService';

export async function getIncidentCluster(incidentId) {
  const relatedIncidents = await getRelatedIncidents(incidentId);
  return {
    mainIncident: incidentId,
    relatedIncidents: relatedIncidents.map(ri => ri.incident.id)
  };
}

export async function getIncidentsInArea(latitude, longitude, radius) {
  return await getIncidentsByLocation({ latitude, longitude }, radius);
}

export async function getFullIncidentTimeline(incidentId) {
  const timeline = await getIncidentTimeline(incidentId);
  return timeline.map(update => ({
    ...update,
    timestamp: new Date(update.timestamp)
  }));
}

export async function getIncidentPropagation(incidentId) {
  const timeline = await getFullIncidentTimeline(incidentId);
  return timeline.map(update => ({
    timestamp: update.timestamp,
    severity: update.severity,
    impactRadius: update.impactRadius
  }));
}