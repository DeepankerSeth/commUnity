'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';

const AuthButton = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Don't render anything on the login page
  if (pathname === '/login') {
    return null;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Button onClick={logout}>Sign out</Button>
      </div>
    );
  }

  return (
    <Link href="/login">
      <Button>Sign in</Button>
    </Link>
  );
};

export default AuthButton;