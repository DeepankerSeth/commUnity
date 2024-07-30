import User from '../models/userModel';
import Notification from '../models/notificationModel';
import IncidentReport from '../models/incidentReport.js';
import { io } from '../server';
import { calculateRiskScore, getRiskLevel, getRecommendedActions } from './riskScoringService';
import { emitNotification } from './socketService';

export async function checkSimilarIncidentsAndNotify(newIncident) {
  const similarIncidents = await IncidentReport.find({
    type: newIncident.type,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [newIncident.longitude, newIncident.latitude]
        },
        $maxDistance: 1000 // 1km radius
      }
    },
    _id: { $ne: newIncident._id },
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  });

  if (similarIncidents.length >= 1) {
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [newIncident.longitude, newIncident.latitude]
          },
          $maxDistance: newIncident.impactRadius * 1609.34 // Convert miles to meters
        }
      }
    });

    for (const user of nearbyUsers) {
      const notification = generateNotification(newIncident, user.location);
      await sendNotification(user, notification);
    }
  }
}

function generateNotification(incident, userLocation) {
  const riskScore = calculateRiskScore(incident, userLocation);
  const riskLevel = getRiskLevel(riskScore);
  const { generalAction, specificAction } = getRecommendedActions(riskScore, incident.type);

  return {
    urgency: riskLevel,
    message: `${riskLevel} ALERT: ${incident.type} reported near your location. ${generalAction}`,
    riskScore,
    incidentId: incident._id,
    generalAction,
    specificAction
  };
}

async function sendNotification(user, notification) {
  const newNotification = new Notification({
    userId: user._id,
    ...notification
  });
  await newNotification.save();
  
  // Emit the notification to the connected client
  emitNotification(user._id.toString(), notification);
  
  // Implement actual notification sending logic here (e.g., push notifications, SMS, email)
  console.log(`Sending ${notification.urgency} notification to user ${user._id}:`, notification.message);
}