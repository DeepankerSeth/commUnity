'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login, logout, register } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: { name: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    loadUser();
  }, []);

  const loginHandler = async (email: string, password: string) => {
    const userData = await login(email, password);
    setUser(userData);
    router.push('/');
  };

  const logoutHandler = () => {
    logout();
    setUser(null);
    router.push('/login');
  };

  const registerHandler = async (name: string, email: string, password: string) => {
    const userData = await register(name, email, password);
    setUser(userData);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: loginHandler, logout: logoutHandler, register: registerHandler }}>
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