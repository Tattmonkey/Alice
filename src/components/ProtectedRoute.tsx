import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  // Special handling for admin routes
  if (location.pathname.startsWith('/admin/dashboard')) {
    if (!user || user.role?.type !== 'admin') {
      return <Navigate to="/admin" replace />;
    }
  } else if (!user) {
    // For non-admin protected routes, redirect to home with return path
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}