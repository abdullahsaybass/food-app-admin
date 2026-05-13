// src/core/api/interceptors.js

import httpClient from './httpClient';
import { useAuthStore } from '../../store/auth.store';

export function setupInterceptors() {
  // attach token to every request
  httpClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // on 401 — clear auth and redirect to login
  httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.replace('/login');
      }
      return Promise.reject(error);
    }
  );
}

