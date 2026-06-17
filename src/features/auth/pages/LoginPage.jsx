// src/features/auth/pages/LoginPage.jsx

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const token = useAuthStore((s) => s.token);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <LoginForm />;
}