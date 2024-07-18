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

export async function searchNonprofits(searchTerm: string) {
  const response = await api.get(`/charities/search/${searchTerm}`);
  return response.data;
}

export async function getNonprofitDetails(identifier: string) {
  const response = await api.get(`/charities/details/${identifier}`);
  return response.data;
}

export async function createFundraiser(nonprofitId: string, title: string, description: string) {
  const response = await api.post('/charities/fundraiser', { nonprofitId, title, description });
  return response.data;
}

export async function generateDonateLink(data: any) {
  const response = await api.post('/charities/donate-link', data);
  return response.data;
}

// function to fetch nearby incidents
export async function fetchNearbyIncidents(latitude: number, longitude: number, maxDistance: number = 5000) {
  const response = await fetch(`/api/incidents/nearby?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}`);
  if (!response.ok) {
    throw new Error('Failed to fetch nearby incidents');
  }
  return response.json();
}