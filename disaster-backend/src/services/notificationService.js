console.log('Loading notificationService.js');

import Notification from '../models/notification.js';
import { getDriver } from '../config/neo4jConfig.js';
import { calculateRiskScore } from './riskScoringService.js';
import { emitNotification } from './socketService.js';
import logger from '../utils/logger.js';


export async function checkSimilarIncidentsAndNotify(newIncident) {
  const session = getDriver().session();
  try {
    const result = await session.run(
      `
      MATCH (i:IncidentReport)
      WHERE i.type = $type
      AND point.distance(point({longitude: i.longitude, latitude: i.latitude}), 
                         point({longitude: $longitude, latitude: $latitude})) <= 1000
      AND i.id <> $id
      AND i.createdAt >= datetime($twentyFourHoursAgo)
      RETURN i
      `,
      {
        type: newIncident.type,
        longitude: newIncident.longitude,
        latitude: newIncident.latitude,
        id: newIncident.id,
        twentyFourHoursAgo: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    );

    const similarIncidents = result.records.map(record => record.get('i').properties);

    if (similarIncidents.length >= 1) {
      const nearbyUsers = await getNearbyUsers(newIncident);

      for (const user of nearbyUsers) {
        const notification = generateNotification(newIncident, user.location);
        await sendNotification(user, notification);
      }
    }
  } catch (error) {
    logger.error('Error checking similar incidents:', error);
  } finally {
    await session.close();
  }
}

async function getNearbyUsers(incident) {
  // This is a placeholder. Implement the actual logic to get nearby users.
  // You might need to query your user database or use a geospatial index.
  logger.info('Getting nearby users for incident:', incident.id);
  return []; // Return an empty array for now
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
    incidentId: incident.id
  };
}

export async function sendNotification(user, notification) {
  try {
    const session = getDriver().session();
    await session.run(
      `
      CREATE (n:Notification {
        id: randomUUID(),
        userId: $userId,
        urgency: $urgency,
        message: $message,
        riskScore: $riskScore,
        incidentId: $incidentId,
        createdAt: datetime()
      })
      RETURN n
      `,
      {
        userId: user.id,
        ...notification
      }
    );
    
    emitNotification(user.id, notification);
    
    logger.info(`Sending ${notification.urgency} notification to user ${user.id}:`, notification.message);
  } catch (error) {
    logger.error('Error sending notification:', error);
  } finally {
    session.close();
  }
}

export default {
  checkSimilarIncidentsAndNotify,
  generateNotification,
  sendNotification
};