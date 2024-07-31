import IncidentReport from '../models/incidentReport';
import { emitIncidentUpdate } from './socketService';
import { updateRiskScoring } from './riskScoringService';

export async function updateIncidentBasedOnFeedback(incidentId, accuracy, usefulness) {
  const incident = await IncidentReport.findById(incidentId);
  if (!incident) throw new Error('Incident not found');

  const severityAdjustment = (accuracy - 3) * 0.1; // Range: -0.2 to +0.2
  incident.severity = Math.max(1, Math.min(10, incident.severity + severityAdjustment));

  const radiusAdjustment = (usefulness - 3) * 0.05; // Range: -0.1 to +0.1 miles
  incident.impactRadius = Math.max(0.1, incident.impactRadius + radiusAdjustment);

  await incident.save();

  // Emit incident update to all connected clients
  emitIncidentUpdate(incident._id, {
    severity: incident.severity,
    impactRadius: incident.impactRadius
  });

  await updateRiskScoring(incidentId, accuracy);
}