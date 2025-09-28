// mrmnew/frontend/src/auth/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  // --- DIAGNOSZTIKA ---
  console.log('%c[ProtectedRoute] Ellenőrzés... isAuthenticated:', 'color: orange;', isAuthenticated, 'User:', user);

  if (!isAuthenticated) {
    console.log('%c[ProtectedRoute] Nincs bejelentkezve, átirányítás /login-ra', 'color: red;');
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && (!user || !roles.includes(user.role))) {
    console.log('%c[ProtectedRoute] Nincs jogosultság, átirányítás a főoldalra.', 'color: red;');
    return <Navigate to="/" replace />;
  }

  console.log('%c[ProtectedRoute] Minden rendben, tartalom megjelenítése.', 'color: green;');
  return <>{children}</>;
}