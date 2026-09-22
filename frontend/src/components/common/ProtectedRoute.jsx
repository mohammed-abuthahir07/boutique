import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Loader from './Loader';

/**
 * Customer Protected Route.
 * Protects pages like /cart, /checkout, /orders, /profile, /wishlist.
 */
export function CustomerProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useCustomerAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen message="Authenticating client session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

/**
 * Admin Protected Route.
 * Protects all /admin/* dashboard and management pages.
 */
export function AdminProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return <Loader fullScreen message="Verifying administrative credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
