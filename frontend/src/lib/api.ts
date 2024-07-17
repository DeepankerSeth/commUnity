import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export async function fetchDisasterData() {
  const response = await api.get('/disaster-data');
  return response.data;
}

export async function reportIncident(incidentData: FormData) {
  const response = await api.post('/incidents', incidentData);
  return response.data;
}

export async function getIncidentUpdates(incidentId: string) {
  const response = await api.get(`/incidents/${incidentId}/updates`);
  return response.data;
}

export async function getEvacuationInstructions(start: string, end: string) {
  const response = await api.post('/evacuation', { start, end });
  return response.data;
}

export async function updateAlertPreferences(userId: string, preferences: any) {
  const response = await api.post('/alert-preferences', { userId, preferences });
  return response.data;
}

