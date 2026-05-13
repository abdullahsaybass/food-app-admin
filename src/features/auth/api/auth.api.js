import httpClient from '../../../core/api/httpClient';

export const loginRequest = async ({ email, password }) => {
  const res = await httpClient.post('/auth/login', { email, password });
  console.log('LOGIN RESPONSE:', res.data); // ← check this in browser console
  return res.data;
};
export const logoutRequest = async () => {
  await httpClient.post('/auth/logout');
};