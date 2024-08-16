// Purpose: Send location-based alerts.

// Improvements:
// Integrated with Geolib for geofencing calculations.

// src/services/geofencingService.js
import geolib from 'geolib'; // Geolib for geofencing calculations
import { sendAlert } from './alertService.js';
import { getUserFromAuth0, updateUserInAuth0 } from '../services/auth0Service.js';
import { sendNotification } from './notificationService.js';

// Function to check if a point is within a geofence
const isWithinGeofence = (lat, lon, geofence) => {
  return geolib.isPointInPolygon(
    { latitude: lat, longitude: lon },
    geofence
  );
};

// Function to send geofence alerts
const geofenceAlert = async (location, message, geofence) => {
  if (isWithinGeofence(location.latitude, location.longitude, geofence)) {
    try {
      await sendAlert(message, [{ type: 'sms', to: location.phoneNumber }]);
    } catch (error) {
      console.error('Error sending geofence alert:', error);
    }
  }
};

// Function to check geofences and notify users
const checkGeofencesAndNotify = async (incident) => {
  const users = await getUsersFromAuth0({
    geofences: {
      $geoIntersects: {
        $geometry: {
          type: "Point",
          coordinates: [incident.longitude, incident.latitude]
        }
      }
    }
  });

  for (const user of users) {
    const notification = generateNotification(incident, user.location);
    await sendNotification(user, notification);
  }
}

// Function to add a geofence for a user
const addGeofence = async (auth0Id, geofenceData) => {
  const user = await getUserFromAuth0(auth0Id);
  if (!user) throw new Error('User not found');

  user.geofences = user.geofences || [];
  user.geofences.push(geofenceData);
  await updateUserInAuth0(auth0Id, { geofences: user.geofences });
  return user.geofences;
}

// Function to remove a geofence for a user
const removeGeofence = async (auth0Id, geofenceId) => {
  const user = await getUserFromAuth0(auth0Id);
  if (!user) throw new Error('User not found');

  user.geofences = (user.geofences || []).filter(geofence => geofence.id !== geofenceId);
  await updateUserInAuth0(auth0Id, { geofences: user.geofences });
  return user.geofences;
}

// Function to update a geofence for a user
const updateGeofence = async (auth0Id, geofenceId, geofenceData) => {
  const user = await getUserFromAuth0(auth0Id);
  if (!user) throw new Error('User not found');

  user.geofences = user.geofences || [];
  const geofenceIndex = user.geofences.findIndex(geofence => geofence.id === geofenceId);
  if (geofenceIndex === -1) throw new Error('Geofence not found');

  user.geofences[geofenceIndex] = { ...user.geofences[geofenceIndex], ...geofenceData };
  await updateUserInAuth0(auth0Id, { geofences: user.geofences });
  return user.geofences[geofenceIndex];
}

// Export the geofenceAlert function
export { geofenceAlert, checkGeofencesAndNotify, addGeofence, removeGeofence, updateGeofence };