// src/services/notificationService.js
import { calculateRiskScore } from './riskScoringService';
import Notification from '../models/notification';
import { emitNotification } from './socketService';

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
  
  // Emit the notification to the connected client
  io.to(user._id.toString()).emit('newNotification', notification);
  
  // Implement actual notification sending logic here (e.g., push notifications, SMS, email)
  console.log(`Sending ${notification.urgency} notification to user ${user._id}:`, notification.message);
}