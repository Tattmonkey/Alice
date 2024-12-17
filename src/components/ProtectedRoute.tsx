import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ['user', 'artist', 'admin'],
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role permissions
  const userRole = user.role?.type || 'user';
  const hasPermission = isAdmin || (allowedRoles && allowedRoles.includes(userRole));

  // Redirect if user role is not allowed
  if (!hasPermission) {
    console.log('[Auth] Access denied:', {
      userRole,
      allowedRoles,
      isAdmin
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
