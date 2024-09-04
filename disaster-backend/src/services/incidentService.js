import { processIncident } from '../ai/llmProcessor.js';
import { createNewIncidentReportNeo4j, getIncidentReportsNeo4j, updateIncidentReport } from './graphDatabaseService.js';

export async function createNewIncidentReport(incidentData) {

  //Implementation here
  
  console.log('Received incident data:', incidentData);
  const analysis = await processIncident(incidentData);
  return createNewIncidentReportNeo4j({ ...incidentData, ...analysis });
}

export async function getIncidentReport(id) {
  return getIncidentReportsNeo4j(id);
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