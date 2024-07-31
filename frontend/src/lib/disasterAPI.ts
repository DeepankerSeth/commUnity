import axios from '../services/authService';

const DISASTER_API_URL = process.env.NEXT_PUBLIC_DISASTER_API_URL || 'http://localhost:3002';

export const reportIncident = async (formData: FormData) => {
  const response = await axios.post(`${DISASTER_API_URL}/incidents/report`, formData);
  return response.data;
};

export const getIncidents = async () => {
  const response = await axios.get(`${DISASTER_API_URL}/incidents`);
  return response.data;
};

export const getIncidentUpdates = async (incidentId: string) => {
  const response = await axios.get(`${DISASTER_API_URL}/incidents/${incidentId}/updates`);
  return response.data;
};

export const getEvacuationInstructions = async (start: string, end: string) => {
  const response = await axios.post(`${DISASTER_API_URL}/evacuation`, { start, end });
  return response.data;
};

export const updateAlertPreferences = async (userId: string, preferences: any) => {
  const response = await axios.post(`${DISASTER_API_URL}/alert-preferences`, { userId, preferences });
  return response.data;
};

export const updateUserLocation = async (locationData: any) => {
  const response = await axios.post(`${DISASTER_API_URL}/user-location`, locationData);
  return response.data;
};

export const getNearbyIncidents = async (latitude: number, longitude: number, maxDistance: number = 5000) => {
  const response = await axios.get(`${DISASTER_API_URL}/incidents/nearby`, {
    params: { latitude, longitude, maxDistance }
  });
  return response.data;
};

export const fetchDisasterData = async () => {
  const response = await axios.get(`${DISASTER_API_URL}/predictions`);
  return response.data;
};

export const fetchUserNotifications = async () => {
  const response = await axios.get(`${DISASTER_API_URL}/user-notifications`);
  return response.data;
};

export const getIncidentClusters = async () => {
  const response = await axios.get(`${DISASTER_API_URL}/incident-clusters`);
  return response.data;
};

export const getIncidentTimeline = async (incidentId: string) => {
  const response = await axios.get(`${DISASTER_API_URL}/incidents/${incidentId}/timeline`);
  return response.data;
};

export const getStatistics = async () => {
  const response = await axios.get(`${DISASTER_API_URL}/statistics`);
  return response.data;
};