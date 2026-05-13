// src/app/guards/AuthGuard.jsx

// src/app/guards/AuthGuard.jsx

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export default function AuthGuard({ children }) {
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!['admin', 'superadmin'].includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}