import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  loginRequest,
  logoutRequest,
} from '../api/auth.api';

import { useAuthStore } from '../../../store/auth.store';

export function useAuth() {
  const {
    setAuth,
    logout,
    token,
    user,
  } = useAuthStore();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const login = async ({
    email,
    password,
  }) => {
    setError(null);

    try {
      setLoading(true);

      const response =
        await loginRequest({
          email,
          password,
        });

      console.log(
        'LOGIN RESPONSE:',
        response,
      );

      // IMPORTANT FIX
      const accessToken =
        response?.data?.accessToken;

      const userData =
        response?.data?.user;

      if (
        !accessToken ||
        !userData
      ) {
        setError(
          'Invalid email or password',
        );

        return;
      }

      // ADMIN CHECK
      if (
        ![
          'admin',
          'superadmin',
        ].includes(userData.role)
      ) {
        setError(
          'Access denied',
        );

        return;
      }

      // STORE AUTH
      setAuth(
        accessToken,
        userData,
      );

      // NAVIGATE
      navigate(
        '/admin/products',
        {
          replace: true,
        },
      );
    } catch (err) {
      console.log(
        'LOGIN ERROR:',
        err,
      );

      setError(
        err?.response?.data
          ?.message ||
          'Invalid email or password',
      );
    } finally {
      setLoading(false);
    }
  };

  const logoutUser =
    async () => {
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