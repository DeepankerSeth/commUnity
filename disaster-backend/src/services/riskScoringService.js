// src/services/riskScoringService.js
console.log('Loading riskScoringService.js');
import { getDistance } from 'geolib';
import { getFeedbackStats } from './feedbackService.js';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

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

export async function updateRiskScoring(incidentId, accuracy) {
  const incident = await IncidentReport.findById(incidentId);
  if (!incident) throw new Error('Incident not found');

  const feedbackStats = await getFeedbackStats(incidentId);
  
  // Adjust severity based on feedback
  const severityAdjustment = (feedbackStats.averageAccuracy - 3) * 0.5; // Range: -1 to +1
  incident.severity = Math.max(1, Math.min(10, incident.severity + severityAdjustment));

  // Adjust impact radius based on feedback
  const radiusAdjustment = (feedbackStats.averageAccuracy - 3) * 0.2; // Range: -0.4 to +0.4 miles
  incident.impactRadius = Math.max(0.1, incident.impactRadius + radiusAdjustment);

  // Adjust verification score based on feedback
  const verificationAdjustment = (feedbackStats.averageAccuracy - 3) * 0.1; // Range: -0.2 to +0.2
  incident.verificationScore = Math.max(0, Math.min(1, incident.verificationScore + verificationAdjustment));

  await incident.save();

  // Recalculate risk scores for nearby users
  const nearbyUsers = await User.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [incident.longitude, incident.latitude]
        },
        $maxDistance: incident.impactRadius * 1609.34 // Convert miles to meters
      }
    }
  });

  for (const user of nearbyUsers) {
    const riskScore = calculateRiskScore(incident, user.location);
    // Emit updated risk score to the user
    emitRiskUpdate(user._id, { incidentId: incident._id, riskScore });
  }
}

export async function assessRiskDynamically(currentIncident, historicalIncidents, realTimeData) {
  const model = new ChatOpenAI();
  const template = `
  Current incident: {currentIncident}
  Historical data: {historicalData}
  Real-time factors: {realTimeFactors}

  Assess the risk level of the current incident. Provide a risk score from 1 to 10 and explain your assessment.
  Format your response as a JSON object with the following structure:
  {
    "riskScore": number,
    "explanation": "string",
    "keyFactors": ["string"],
    "potentialEscalationScenarios": ["string"],
    "recommendedPrecautions": ["string"]
  }
  `;
  const prompt = new PromptTemplate({ template, inputVariables: ["currentIncident", "historicalData", "realTimeFactors"] });

  const chain = prompt.pipe(model);
  const response = await chain.invoke({
    currentIncident: JSON.stringify(currentIncident),
    historicalData: JSON.stringify(historicalIncidents),
    realTimeFactors: JSON.stringify(realTimeData)
  });

  return JSON.parse(response.text);
}