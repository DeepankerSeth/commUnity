// Purpose: Send location-based alerts.

// Improvements:
// Integrated with Geolib for geofencing calculations.

// src/services/geofencingService.js
import geolib from 'geolib'; // Geolib for geofencing calculations
import { sendAlert } from './alertService';
import User from '../models/userModel';
import IncidentReport from '../models/incidentReport';
import { sendNotification } from './notificationService';

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
export async function checkGeofencesAndNotify(incident) {
  const users = await User.find({
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
export async function addGeofence(userId, geofenceData) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.geofences.push(geofenceData);
  await user.save();
  return user.geofences;
}

// Function to remove a geofence for a user
export async function removeGeofence(userId, geofenceId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.geofences = user.geofences.filter(geofence => geofence._id.toString() !== geofenceId);
  await user.save();
  return user.geofences;
}

// Function to update a geofence for a user
export async function updateGeofence(userId, geofenceId, geofenceData) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const geofenceIndex = user.geofences.findIndex(geofence => geofence._id.toString() === geofenceId);
  if (geofenceIndex === -1) throw new Error('Geofence not found');

  user.geofences[geofenceIndex] = { ...user.geofences[geofenceIndex], ...geofenceData };
  await user.save();
  return user.geofences[geofenceIndex];
}

// Export the geofenceAlert function
export { geofenceAlert, checkGeofencesAndNotify, addGeofence, removeGeofence, updateGeofence };