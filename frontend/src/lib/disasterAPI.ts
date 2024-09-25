import axios, { AxiosError } from 'axios';
import { getDisasterBackendUrl } from '../utils/api';

const api = axios.create({
  baseURL: getDisasterBackendUrl(),
});

// Adjusted interceptor for synchronous function
api.interceptors.request.use((config) => {
  if (!config.url) return config;

  // Only modify the URL if it's a relative path
  if (!config.url.startsWith('http')) {
    const baseURL = getDisasterBackendUrl();
    config.url = `${baseURL}${config.url}`;
  }

  return config;
});

// Helper function for error logging
const logError = (error: AxiosError) => {
  console.error('API Error:', error.message);
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
  } else if (error.request) {
    console.error('No response received:', error.request);
  } else {
    console.error('Error setting up request:', error.config);
  }
};

export const reportIncident = async (formData: FormData) => {
  try {
    console.log('Submitting incident with formData:', Object.fromEntries(formData));
    const response = await api.post('/api/incidents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('Incident submission response:', response.data);
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to report incident. Please try again.');
  }
};

export const getIncidents = async () => {
  try {
    const response = await api.get('/api/incidents');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to fetch incidents.');
  }
};

export const getIncidentDetails = async (incidentId: string) => {
  try {
    const response = await api.get(`/api/incidents/${incidentId}`);
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to fetch incident details.');
  }
};

export const getIncidentUpdates = async (incidentId: string) => {
  try {
    const response = await api.get(`/api/incidents/${incidentId}/updates`);
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to fetch incident updates.');
  }
};

export const updateAlertPreferences = async (userId: string, preferences: any) => {
  try {
    const response = await api.post('/api/alert-preferences', { userId, preferences });
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to update alert preferences.');
  }
};

export const updateUserLocation = async (locationData: any) => {
  try {
    const response = await api.post('/api/user-location', locationData);
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to update user location.');
  }
};

export const getNearbyIncidents = async (
  latitude: number, 
  longitude: number, 
  maxDistance: number = 5000, 
  limit: number = 10, 
  offset: number = 0
) => {
  try {
    const response = await api.get('/api/incidents/nearby', {
      params: { latitude, longitude, maxDistance, limit, offset }
    });
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to fetch nearby incidents.');
  }
};

export const fetchDisasterData = async () => {
  try {
    const response = await api.get('/api/predictions');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to fetch disaster data.');
  }
};

export const fetchUserNotifications = async () => {
  try {
    const response = await api.get('/api/user-notifications');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to fetch user notifications.');
  }
};

export const getIncidentClusters = async () => {
  try {
    const response = await api.get('/api/incident-clusters');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to fetch incident clusters.');
  }
};

export const getIncidentTimeline = async (incidentId: string) => {
  try {
    const response = await api.get(`/api/incidents/${incidentId}/timeline`);
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to fetch incident timeline.');
  }
};

export const getStatistics = async () => {
  try {
    const response = await api.get('/api/statistics');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to fetch statistics.');
  }
};

export const searchLocations = async (query: string) => {
  try {
    const response = await api.get('/api/locations/search', { params: { query } });
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to search locations.');
  }
};

export const getLocationDetails = async (placeId: string) => {
  try {
    const response = await api.get('/api/locations/details', { params: { placeId } });
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to get location details.');
  }
};

export const performHybridSearch = async (query: string, limit: number = 10, filters: Record<string, string> = {}) => {
  try {
    const params = new URLSearchParams({ query, limit: limit.toString(), ...filters });
    const response = await api.get(`/api/search?${params}`);
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to perform hybrid search.');
  }
};

export const getFacets = async () => {
  try {
    const response = await api.get('/api/facets');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to get facets.');
  }
};

export const getIncidentCluster = async (incidentId: string) => {
  try {
    const response = await api.get(`/api/incidents/${incidentId}/cluster`);
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to get incident cluster.');
  }
};

export const getIncidentsInArea = async (latitude: number, longitude: number, radius: number) => {
  try {
    const response = await api.get('/api/incidents/area', { params: { latitude, longitude, radius } });
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to get incidents in area.');
  }
};

export const getFullIncidentTimeline = async (incidentId: string) => {
  try {
    const response = await api.get(`/api/incidents/${incidentId}/timeline`);
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to get full incident timeline.');
  }
};

export const getIncidentPropagation = async (incidentId: string) => {
  try {
    const response = await api.get(`/api/incidents/${incidentId}/propagation`);
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to get incident propagation.');
  }
};

export const provideFeedback = async (incidentId: string, accuracy: number, usefulness: number) => {
  try {
    const response = await api.post(`/api/incidents/${incidentId}/feedback`, { accuracy, usefulness });
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to provide feedback.');
  }
};

export const getTrendAnalysis = async () => {
  try {
    const response = await api.get('/api/analysis/trends');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to get trend analysis.');
  }
};

export const getPredictions = async () => {
  try {
    const response = await api.get('/api/analysis/predictions');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to get predictions.');
  }
};

export const getVisualizationData = async () => {
  try {
    const response = await api.get('/api/visualization/data');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to get visualization data.');
  }
};

export const getApiKey = async () => {
  try {
    const response = await api.get('/api/api-key');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to get API key.');
  }
};

export const revokeApiKey = async () => {
  try {
    const response = await api.post('/api/api-key/revoke');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to revoke API key.');
  }
};

export const regenerateApiKey = async () => {
  try {
    const response = await api.post('/api/api-key/regenerate');
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to regenerate API key.');
  }
};

export interface EvacuationRoute {
  name: string;
  description: string;
}

export const getEvacuationInstructions = async (start: string, end: string): Promise<EvacuationRoute[]> => {
  try {
    const response = await api.get('/api/evacuation-instructions', { params: { start, end } });
    return response.data;
  } catch (error) {
    logError(error as AxiosError);
    throw new Error('Failed to get evacuation instructions.');
  }
};
