'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';

const AuthenticatedProviders = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  return (
    <SocketProvider token={token}>
      {children}
    </SocketProvider>
  );
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <AuthenticatedProviders>{children}</AuthenticatedProviders>
      </AuthProvider>
    </SessionProvider>
  );
}