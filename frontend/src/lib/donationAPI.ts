import axios from '../services/authService';

const DONATION_API_URL = process.env.NEXT_PUBLIC_DONATION_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: DONATION_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const searchNonprofits = async (searchTerm: string, take?: number, causes?: string) => {
  const response = await api.get(`/api/charities/search/${searchTerm}`, {
    params: { take, causes }
  });
  return response.data;
};

export const getNonprofitDetails = async (nonprofitId: string) => {
  const response = await api.get(`/api/charities/${nonprofitId}`);
  return response.data;
};

export const createFundraiser = async (nonprofitId: string, title: string, description: string) => {
  const response = await api.post(`/api/charities/fundraiser`, {
    nonprofitId, title, description
  });
  return response.data;
};

export const generateDonateLink = async (request: DonateLinkRequest) => {
  const response = await api.post(`/api/charities/donate-link`, request);
  return response.data.donateLink;
};

export interface DonateLinkRequest {
  nonprofitId: string;
  amount: number;
}

export interface Nonprofit {
  id: string;
  name: string;
  // Add other relevant fields
}

export interface NonprofitDetails extends Nonprofit {
  description: string;
  // Add other detailed fields
}