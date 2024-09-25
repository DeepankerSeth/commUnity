//disaster-backend/src/services/incidentService.js

import { processIncident } from '../ai/llmProcessor.js';
import { createNewIncidentReportNeo4j, getIncidentReportNeo4j } from './graphDatabaseService.js';

export async function createNewIncidentReport(incidentData) {
  console.log('Received incident data:', incidentData);
  const analysis = await processIncident(incidentData);
  const combinedData = { 
    ...incidentData, 
    ...analysis,
    metadata: {
      ...incidentData.metadata,
      ...analysis,
      keywords: analysis.keywords || [],
      incidentName: analysis.incidentName || 'Unnamed Incident',
      placeOfImpact: analysis.placeOfImpact || 'Unknown Location',
      neighborhood: analysis.neighborhood || 'Unknown Neighborhood'
    },
    severity: analysis.severity || 0,
    impactRadius: analysis.impactRadius || 0
  };
  return createNewIncidentReportNeo4j(combinedData);
}

export async function getIncidentReport(incidentId) {
  return getIncidentReportNeo4j(incidentId);
}

export async function updateIncidentBasedOnFeedback(incidentId, accuracy, usefulness) {
  const incident = await getIncidentReport(incidentId);
  if (!incident) {
    throw new Error('Incident not found');
  }

  // Adjust severity based on feedback
  const severityAdjustment = (accuracy - 3) * 0.2; // Range: -0.4 to +0.4
  incident.severity = Math.max(1, Math.min(5, incident.severity + severityAdjustment));

  // Reprocess the incident with the updated information
  const updatedAnalysis = await processIncident({
    ...incident,
    userFeedback: { accuracy, usefulness }
  });

  // Update the incident report
  const updatedIncident = await updateIncidentReport(incidentId, {
    severity: incident.severity,
    analysis: updatedAnalysis.analysis,
    impactRadius: updatedAnalysis.impactRadius,
    // Add any other fields that might be affected by the feedback
  });

  return updatedIncident;
}