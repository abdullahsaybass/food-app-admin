// src/features/user/api/user.api.js

import httpClient from '../../../core/api/httpClient';

// GET /api/admin/users
export const getAllUsers = async () => {
  const { data } = await httpClient.get('/admin/users');

  // adjust based on your backend shape 👇
  return data.data?.users || data.data || [];
};
// GET /api/admin/users/:id
export const getUserById = async (id) => {
  const { data } = await httpClient.get(`/admin/users/${id}`);
  return data;
};

// PUT /api/admin/users/:id
export const updateUser = async (id, payload) => {
  const { data } = await httpClient.put(`/admin/users/${id}`, payload);
  return data;
};

// DELETE /api/admin/users/:id  (superAdmin only)
export const deleteUser = async (id) => {
  const { data } = await httpClient.delete(`/admin/users/${id}`);
  return data;
};

// POST /api/admin/users/seed
export const seedAdmin = async () => {
  const { data } = await httpClient.post('/admin/users/seed');
  return data;
};