'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import AuthButton from '@/components/AuthButton';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider token={null}>
        <header className="flex justify-end items-center p-4 bg-white shadow-sm">
          <nav>
            <AuthButton />
          </nav>
        </header>
        {children}
      </SocketProvider>
    </AuthProvider>
  );
}
