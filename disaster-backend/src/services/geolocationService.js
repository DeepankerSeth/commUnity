import axios from 'axios';
import logger from '../utils/logger.js';

const IPSTACK_API_KEY = process.env.IPSTACK_API_KEY;

// Add error handling for invalid IP addresses
export async function getIPGeolocation(ip) {
  try {
    if (!ip || typeof ip !== 'string') {
      throw new Error('Invalid IP address');
    }
    const response = await axios.get(`http://api.ipstack.com/${ip}?access_key=${IPSTACK_API_KEY}`);
    return response.data;
  } catch (error) {
    logger.error('Error fetching IP geolocation:', error);
    throw error;
  }
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}
