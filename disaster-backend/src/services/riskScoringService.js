// src/services/riskScoringService.js
import { getDistance } from 'geolib';

const SEVERITY_WEIGHT = 0.5;
const DISTANCE_WEIGHT = 0.3;
const TIME_WEIGHT = 0.2;

export function calculateRiskScore(incident, userLocation) {
  const { severity, impactRadius, createdAt, location } = incident;
  const { latitude, longitude } = userLocation;

  // Calculate distance factor (1 at center, 0 at edge of impact zone)
  const distance = getDistance(
    { latitude, longitude },
    { latitude: location.coordinates[1], longitude: location.coordinates[0] }
  );
  const distanceFactor = Math.max(0, 1 - (distance / (impactRadius * 1609.34))); // Convert miles to meters

  // Calculate time factor (1 when just created, decreasing over time)
  const timeSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60); // Hours
  const timeFactor = Math.max(0, 1 - (timeSinceCreation / 24)); // Assume risk decreases over 24 hours

  // Calculate weighted score
  const severityScore = (severity / 10) * SEVERITY_WEIGHT;
  const distanceScore = distanceFactor * DISTANCE_WEIGHT;
  const timeScore = timeFactor * TIME_WEIGHT;

  const riskScore = (severityScore + distanceScore + timeScore) * 100;

  return Math.round(riskScore);
}

export function getRiskLevel(riskScore) {
  if (riskScore >= 80) return 'Critical';
  if (riskScore >= 60) return 'High';
  if (riskScore >= 40) return 'Moderate';
  if (riskScore >= 20) return 'Low';
  return 'Minimal';
}

export function getRecommendedActions(riskScore, incidentType) {
  const riskLevel = getRiskLevel(riskScore);
  const generalActions = {
    Critical: 'Evacuate immediately. Follow official instructions.',
    High: 'Prepare for possible evacuation. Stay alert for updates.',
    Moderate: 'Be prepared to act. Monitor official channels for updates.',
    Low: 'Stay informed. Review your emergency plan.',
    Minimal: 'Be aware of the situation. No immediate action required.'
  };

  const specificActions = {
    Earthquake: {
      Critical: 'Drop, cover, and hold on. Move to open areas if safe to do so.',
      High: 'Secure heavy objects. Identify safe spots in each room.',
      Moderate: 'Practice earthquake drills. Check emergency supplies.',
    },
    Flood: {
      Critical: 'Move to higher ground immediately. Avoid walking or driving through flood waters.',
      High: 'Prepare to move valuables to upper floors. Charge devices and prepare go-bag.',
      Moderate: 'Clear drains and gutters. Move vehicles to higher ground.',
    },
    Wildfire: {
      Critical: 'Evacuate immediately if ordered. Close all windows and doors.',
      High: 'Pack your go-bag. Clear area around house of flammable materials.',
      Moderate: 'Review evacuation plans. Ensure outdoor water sources are accessible.',
    }
  };

  return {
    generalAction: generalActions[riskLevel],
    specificAction: specificActions[incidentType]?.[riskLevel] || generalActions[riskLevel]
  };
}