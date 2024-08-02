'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams?.get('token');
    if (token) {
      localStorage.setItem('user', JSON.stringify({ token }));
      router.push('/');
    } else {
      setError('Authentication failed. Please try again.');
      setTimeout(() => router.push('/login'), 3000);
    }
  }, [router, searchParams]);

  if (error) {
    return <div>{error}</div>;
  }

  return <div>Processing authentication...</div>;
};

export default AuthCallback;