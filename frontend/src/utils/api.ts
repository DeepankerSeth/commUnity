export function getDisasterBackendUrl(): string {
  return process.env.NEXT_PUBLIC_DISASTER_BACKEND_URL || 'http://localhost:4000';
}

export function getDonationBackendUrl(): string {
  return process.env.NEXT_PUBLIC_DONATION_BACKEND_URL || 'http://localhost:5001';
}