'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login, logout, register, refreshToken } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const refreshTokenPeriodically = setInterval(async () => {
      if (isAuthenticated) {
        try {
          const newToken = await refreshToken();
          setToken(newToken);
        } catch (error) {
          console.error('Token refresh failed:', error);
          await logoutHandler();
        }
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(refreshTokenPeriodically);
  }, [isAuthenticated]);

  const loginHandler = async (email: string, password: string) => {
    try {
      const userData = await login(email, password);
      setUser(userData.user);
      setToken(userData.token);
      setIsAuthenticated(true);
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logoutHandler = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const registerHandler = async (name: string, email: string, password: string) => {
    try {
      const userData = await register(name, email, password);
      setUser(userData.user);
      setToken(userData.token);
      setIsAuthenticated(true);
      router.push('/');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login: loginHandler, 
        logout: logoutHandler, 
        register: registerHandler,
        isAuthenticated,
        token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};