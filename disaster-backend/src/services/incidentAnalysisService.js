// src/services/incidentAnalysisService.js
import { getDistance } from 'geolib';

export function calculateDynamicImpactZone(incident, allIncidents) {
  const { latitude, longitude, impactRadius } = incident;
  const baseRadius = impactRadius * 1609.34; // Convert miles to meters

  // Find similar incidents within twice the base radius
  const similarIncidents = allIncidents.filter(inc => 
    inc.type === incident.type &&
    getDistance(
      { latitude: inc.latitude, longitude: inc.longitude },
      { latitude, longitude }
    ) <= baseRadius * 2
  );

  // Calculate the average impact radius of similar incidents
  const avgRadius = similarIncidents.reduce((sum, inc) => sum + inc.impactRadius, 0) / similarIncidents.length;

  // Use the larger of the two: base radius or average radius
  const finalRadius = Math.max(baseRadius, avgRadius * 1000);

  return {
    center: { latitude, longitude },
    radius: finalRadius
  };
}
