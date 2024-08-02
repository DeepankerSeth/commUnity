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