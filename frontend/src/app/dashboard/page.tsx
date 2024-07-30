import React from 'react';
import PrivateRoute from '@/components/PrivateRoute';

const Dashboard: React.FC = () => {
  return (
    <PrivateRoute>
      <div>
        <h1>Dashboard</h1>
        <p>This is a protected page. Only authenticated users can see this content.</p>
      </div>
    </PrivateRoute>
  );
};

export default Dashboard;