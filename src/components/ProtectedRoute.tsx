import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode | ((props: { user: User }) => React.ReactNode);
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (typeof children === 'function') {
    return <>{children({ user })}</>;
  }

  return <>{children}</>;
}
