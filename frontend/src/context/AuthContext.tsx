'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';
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
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    } else {
      setLoading(false);
      if (session) {
        setUser(session.user as User);
        setIsAuthenticated(true);
        setToken((session.user as any).accessToken || null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setToken(null);
      }
    }
  }, [session, status]);

  const loginHandler = async (email: string, password: string) => {
    const result = await signIn('credentials', { 
      email, 
      password, 
      redirect: false,
    });
    if (result?.error) {
      throw new Error(result.error);
    }
  };

  const logoutHandler = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const registerHandler = async (name: string, email: string, password: string) => {
    // Implement registration logic here
    // You may need to create a new API route for registration
  };

  const getToken = async () => {
    const session = await getSession();
    return (session?.user as any)?.accessToken || null;
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
        token,
        getToken
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