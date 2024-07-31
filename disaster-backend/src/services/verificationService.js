import IncidentReport from '../models/incidentReport';
import User from '../models/userModel';
import axios from 'axios';

const OFFICIAL_SOURCE_API = process.env.OFFICIAL_SOURCE_API;

export async function verifyIncident(incidentId) {
  const incident = await IncidentReport.findById(incidentId);
  if (!incident) throw new Error('Incident not found');

  const userVerification = await getUserVerification(incident);
  const officialVerification = await getOfficialVerification(incident);
  const aiVerification = await getAIVerification(incident);

  const verificationScore = calculateVerificationScore(userVerification, officialVerification, aiVerification);

  incident.verificationScore = verificationScore;
  incident.verificationDetails = {
    userVerification,
    officialVerification,
    aiVerification
  };
  incident.verificationStatus = verificationScore >= 0.7 ? 'Verified' : 'Unverified';

  // Update the incident's timeline with the verification result
  incident.timeline.push({
    update: `Incident verification: ${incident.verificationStatus}`,
    verificationScore: verificationScore,
    timestamp: new Date()
  });

  await incident.save();

  // Emit verification update to all connected clients
  emitVerificationUpdate(incident._id, {
    verificationScore,
    verificationStatus: incident.verificationStatus
  });

  return {
    verificationScore,
    verificationStatus: incident.verificationStatus
  };
}

async function getUserVerification(incident) {
  const nearbyUsers = await User.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [incident.longitude, incident.latitude]
        },
        $maxDistance: 5000 // 5km radius
      }
    },
    reputation: { $gte: 50 } // Only consider users with good reputation
  });

  const verifications = await Promise.all(nearbyUsers.map(user => checkUserVerification(user, incident)));
  const positiveVerifications = verifications.filter(v => v).length;

  return positiveVerifications / nearbyUsers.length;
}

async function checkUserVerification(user, incident) {
  // Implement logic to check if user has verified the incident
  // This could involve checking a separate collection for user verifications
  // For now, we'll return a random boolean
  return Math.random() < 0.7; // 70% chance of verification
}

async function getOfficialVerification(incident) {
  try {
    const response = await axios.get(OFFICIAL_SOURCE_API, {
      params: {
        lat: incident.latitude,
        lon: incident.longitude,
        type: incident.type
      }
    });
    return response.data.verified ? 1 : 0;
  } catch (error) {
    console.error('Error getting official verification:', error);
    return 0;
  }
}

async function getAIVerification(incident) {
  // Implement AI-based verification logic here
  // For now, we'll return a random score
  return Math.random();
}

function calculateVerificationScore(userVerification, officialVerification, aiVerification) {
  // Weighted average of different verification methods
  const weights = {
    user: 0.3,
    official: 0.5,
    ai: 0.2
  };

  return (
    userVerification * weights.user +
    officialVerification * weights.official +
    aiVerification * weights.ai
  );
}