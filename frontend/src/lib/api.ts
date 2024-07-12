const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export async function fetchDisasterData() {
  const response = await fetch(`${API_BASE_URL}/disaster-data`);
  if (!response.ok) {
    throw new Error('Failed to fetch disaster data');
  }
  return response.json();
}

export async function reportIncident(incidentData: FormData) {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: 'POST',
    body: incidentData,
  });
  if (!response.ok) {
    throw new Error('Failed to report incident');
  }
  return response.json();
}

export async function getIncidentUpdates(incidentId: string) {
  const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/updates`);
  if (!response.ok) {
    throw new Error('Failed to fetch incident updates');
  }
  return response.json();
}

export async function getEvacuationInstructions(start: string, end: string) {
  const response = await fetch(`${API_BASE_URL}/evacuation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ start, end }),
  });
  if (!response.ok) {
    throw new Error('Failed to get evacuation instructions');
  }
  return response.json();
}

export async function updateAlertPreferences(userId: string, preferences: any) {
  const response = await fetch(`${API_BASE_URL}/alert-preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, preferences }),
  });
  if (!response.ok) {
    throw new Error('Failed to update alert preferences');
  }
  return response.json();
}