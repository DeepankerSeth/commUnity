import { UserProfile } from '@auth0/nextjs-auth0/client';

export const getUser = async (): Promise<UserProfile | null> => {
  const response = await fetch('/api/auth/me');
  if (response.ok) {
    const data = await response.json();
    return data.user;
  }
  return null;
};

export const login = () => {
  // Redirect to Auth0 login page
  window.location.href = '/api/auth/login';
};

export const logout = () => {
  // Redirect to Auth0 logout
  window.location.href = '/api/auth/logout';
};