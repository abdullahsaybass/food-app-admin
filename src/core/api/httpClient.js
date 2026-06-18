import axios from 'axios';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.vfresh.shop/api',
});

httpClient.interceptors.request.use((config) => {
  // 👇 read persisted data directly
  const raw = localStorage.getItem('auth-storage');

  let token = null;

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      token = parsed?.state?.token;
    } catch (e) {
      console.error("Failed to parse auth-storage", e);
    }
  }

  console.log("TOKEN FROM STORAGE:", token);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default httpClient;
