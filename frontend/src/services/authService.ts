import axios from 'axios';
import { signIn } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  const response = await axios.get(`${API_URL}/csrf-token`);
  config.headers['X-CSRF-Token'] = response.data.csrfToken;
  return config;
});

export const login = async (email: string, password: string) => {
  try {
    const response = await signIn('credentials', { email, password, redirect: false });
    if (response?.error) {
      throw new Error(response.error);
    }
    return response;
  } catch (error) {
    throw new Error('Login failed');
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await axiosInstance.post('/auth/register', { name, email, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw new Error('Registration failed');
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post('/auth/refresh-token');
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw new Error('Token refresh failed');
  }
};

export const initiateGoogleLogin = async () => {
  try {
    const response = await axiosInstance.get('/auth/google');
    window.location.href = response.data.authUrl;
  } catch (error) {
    throw new Error('Failed to initiate Google login');
  }
};

export const initiateFacebookLogin = async () => {
  try {
    const response = await axiosInstance.get('/auth/facebook');
    window.location.href = response.data.authUrl;
  } catch (error) {
    throw new Error('Failed to initiate Facebook login');
  }
};

export const initiateAppleLogin = async () => {
  try {
    const response = await axiosInstance.get('/auth/apple');
    window.location.href = response.data.authUrl;
  } catch (error) {
    throw new Error('Failed to initiate Apple login');
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        logout();
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;