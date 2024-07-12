// Purpose: Send location-based alerts.

// Improvements:
// Integrated with Geolib for geofencing calculations.

// src/services/geofencingService.js
const geolib = require('geolib'); // Geolib for geofencing calculations
const { sendAlert } = require('./alertService');

// Function to check if a point is within a geofence
const isWithinGeofence = (lat, lon, geofence) => {
  return geolib.isPointInPolygon(
    { latitude: lat, longitude: lon },
    geofence
  );
};

// Function to send geofence alerts
const geofenceAlert = (location, message, geofence) => {
  if (isWithinGeofence(location.latitude, location.longitude, geofence)) {
    sendAlert(message, [{ type: 'sms', to: location.phoneNumber }]);
  }
};

// Export the geofenceAlert function
module.exports = { geofenceAlert };

