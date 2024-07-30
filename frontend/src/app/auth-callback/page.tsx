'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get('token');
    if (token) {
      localStorage.setItem('user', JSON.stringify({ token }));
      router.push('/');
    }
  }, [router, searchParams]);

  return <div>Processing authentication...</div>;
};

export default AuthCallback;