// src/features/auth/hooks/useAuth.js

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest, logoutRequest } from '../api/auth.api';
import { useAuthStore } from '../../../store/auth.store';

export function useAuth() {
  const { setAuth, logout, token, user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async ({ email, password }) => {
    setError(null);

    try {
      setLoading(true);

      const data = await loginRequest({ email, password });

      if (!data?.token || !data?.user) {
        setError('Invalid email or password');
        return;
      }

      // restrict to admin
      if (!['admin', 'superadmin'].includes(data.user.role)) {
        setError('Access denied');
        return;
      }

      setAuth(data.token, data.user);

      navigate('/admin/products', { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await logoutRequest();
    } catch (_) {}

    logout();
    navigate('/login');
  };

  return {
    user,
    token,
    isLoggedIn: !!token,
    loading,
    error,
    login,
    logout: logoutUser,
  };
}