import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DISASTER_API_URL = process.env.NEXT_PUBLIC_DISASTER_API_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: DISASTER_API_URL,
});

api.interceptors.request.use(async (config) => {
  const { getToken } = useAuth();
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reportIncident = async (formData: FormData) => {
  const response = await api.post('/incidents/report', formData);
  return response.data;
};

export const getIncidents = async () => {
  const response = await api.get('/incidents');
  return response.data;
};

export const getIncidentDetails = async (incidentId: string) => {
  const response = await api.get(`/incidents/${incidentId}`);
  return response.data;
};

export const getIncidentUpdates = async (incidentId: string) => {
  const response = await api.get(`/incidents/${incidentId}/updates`);
  return response.data;
};

export const getEvacuationInstructions = async (start: string, end: string) => {
  const response = await api.post('/evacuation', { start, end });
  return response.data;
};

export const updateAlertPreferences = async (userId: string, preferences: any) => {
  const response = await api.post('/alert-preferences', { userId, preferences });
  return response.data;
};

export const updateUserLocation = async (locationData: any) => {
  const response = await api.post('/user-location', locationData);
  return response.data;
};

export const getNearbyIncidents = async (latitude: number, longitude: number, maxDistance: number = 5000) => {
  const response = await api.get('/incidents/nearby', {
    params: { latitude, longitude, maxDistance }
  });
  return response.data;
};

export const fetchDisasterData = async () => {
  const response = await api.get('/predictions');
  return response.data;
};

export const fetchUserNotifications = async () => {
  const response = await api.get('/user-notifications');
  return response.data;
};

export const getIncidentClusters = async () => {
  const response = await api.get('/incident-clusters');
  return response.data;
};

export const getIncidentTimeline = async (incidentId: string) => {
  const response = await api.get(`/incidents/${incidentId}/timeline`);
  return response.data;
};

export const getStatistics = async () => {
  const response = await api.get('/statistics');
  return response.data;
};

export const searchLocations = async (query: string) => {
  const response = await api.get('/locations/search', { params: { query } });
  return response.data;
};

export const getLocationDetails = async (placeId: string) => {
  const response = await api.get('/locations/details', { params: { placeId } });
  return response.data;
};

export const performHybridSearch = async (query: string, limit: number = 10, filters: Record<string, string> = {}) => {
  const params = new URLSearchParams({ query, limit: limit.toString(), ...filters });
  const response = await api.get(`${DISASTER_API_URL}/search?${params}`);
  return response.data;
}

export const getFacets = async () => {
  const response = await api.get(`${DISASTER_API_URL}/facets`);
  return response.data;
}

export const getIncidentCluster = async (incidentId: string) => {
  const response = await api.get(`${DISASTER_API_URL}/incidents/${incidentId}/cluster`);
  return response.data;
};

export const getIncidentsInArea = async (latitude: number, longitude: number, radius: number) => {
  const response = await api.get(`${DISASTER_API_URL}/incidents/area`, { params: { latitude, longitude, radius } });
  return response.data;
};

export const getFullIncidentTimeline = async (incidentId: string) => {
  const response = await api.get(`${DISASTER_API_URL}/incidents/${incidentId}/timeline`);
  return response.data;
};

export const getIncidentPropagation = async (incidentId: string) => {
  const response = await api.get(`${DISASTER_API_URL}/incidents/${incidentId}/propagation`);
  return response.data;
};

export const provideFeedback = async (incidentId: string, accuracy: number, usefulness: number) => {
  const response = await api.post(`${DISASTER_API_URL}/incidents/${incidentId}/feedback`, { accuracy, usefulness });
  return response.data;
};

export async function getTrendAnalysis() {
  const response = await api.get(`${DISASTER_API_URL}/analysis/trends`);
  return response.data;
}

export async function getPredictions() {
  const response = await api.get(`${DISASTER_API_URL}/analysis/predictions`);
  return response.data;
}

export async function getVisualizationData() {
  const response = await api.get(`${DISASTER_API_URL}/visualization/data`);
  return response.data;
}

export async function getApiKey() {
  const response = await api.get('/api-key');
  return response.data;
}

export async function revokeApiKey() {
  const response = await api.post('/api-key/revoke');
  return response.data;
}

export async function regenerateApiKey() {
  const response = await api.post('/api-key/regenerate');
  return response.data;
}