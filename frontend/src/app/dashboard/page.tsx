'use client';

import WithAuth from '@/components/WithAuth';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Dashboard() {
  const { user } = useUser();

  return (
    <WithAuth>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
    </WithAuth>
  );
}