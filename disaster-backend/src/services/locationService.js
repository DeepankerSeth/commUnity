import axios from 'axios';
import NodeCache from 'node-cache';
import geohash from 'ngeohash';
import Location from '../models/location';
import { getCachedLocation, setCachedLocation } from './locationCacheService.js';

const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function searchLocations(query, userId) {
  const cacheKey = `${userId}:${query}`;
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const cachedLocationResult = getCachedLocation(query);
  if (cachedLocationResult) {
    return cachedLocationResult;
  }

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
      params: {
        input: query,
        key: GOOGLE_MAPS_API_KEY,
        types: '(cities)(regions)'
      }
    });

    const predictions = response.data.predictions.map(prediction => ({
      placeId: prediction.place_id,
      description: prediction.description
    }));

    setCachedLocation(query, predictions);
    cache.set(cacheKey, predictions);
    return predictions;
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    throw error;
  }
}

export async function getLocationDetails(placeId) {
  const cachedResult = cache.get(placeId);
  if (cachedResult) {
    return cachedResult;
  }

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY,
        fields: 'geometry'
      }
    });

    const location = response.data.result.geometry.location;
    const result = {
      latitude: location.lat,
      longitude: location.lng,
      geohash: geohash.encode(location.lat, location.lng)
    };

    cache.set(placeId, result);
    await saveLocationToDatabase(placeId, result);
    return result;
  } catch (error) {
    console.error('Error fetching location details:', error);
    throw error;
  }
}

async function saveLocationToDatabase(placeId, locationData) {
  try {
    await Location.findOneAndUpdate(
      { placeId },
      { ...locationData, placeId },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error saving location to database:', error);
  }
}