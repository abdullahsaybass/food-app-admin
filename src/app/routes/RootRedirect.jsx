// src/app/routes/RootRedirect.jsx

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export default function RootRedirect() {
  const token = useAuthStore((s) => s.token);

  return token
    ? <Navigate to="/" replace />
    : <Navigate to="/login" replace />;
}