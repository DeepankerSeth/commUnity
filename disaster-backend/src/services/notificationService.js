import User from '../models/userModel';
import Notification from '../models/notificationModel';
import IncidentReport from '../models/incidentReport.js';
import { calculateRiskScore } from './riskScoringService';
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

export function generateNotification(incident, userLocation) {
  const riskScore = calculateRiskScore(incident, userLocation);
  let urgency, action;

  if (riskScore >= 80) {
    urgency = 'URGENT';
    action = 'Evacuate immediately';
  } else if (riskScore >= 50) {
    urgency = 'WARNING';
    action = 'Prepare for possible evacuation';
  } else if (riskScore >= 20) {
    urgency = 'ALERT';
    action = 'Stay informed and be prepared';
  } else {
    urgency = 'ADVISORY';
    action = 'Be aware of the situation';
  }

  return {
    urgency,
    message: `${urgency}: ${incident.type} reported near your location. ${action}.`,
    riskScore,
    incidentId: incident._id
  };
}

export async function sendNotification(user, notification) {
  const newNotification = new Notification({
    userId: user._id,
    ...notification
  });
  await newNotification.save();
  
  emitNotification(user._id.toString(), notification);
  
  // Implement actual notification sending logic here (e.g., push notifications, SMS, email)
  console.log(`Sending ${notification.urgency} notification to user ${user._id}:`, notification.message);
}