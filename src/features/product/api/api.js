// src/features/products/api.js

import apiClient from '../../../core/api/httpClient.js';

export const productApi = {
  list: async (params) => {
    const { data } = await apiClient.get('/products', { params });
    return data.data;
  },

  getById: async (id) => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  getLowStock: async () => {
    const { data } = await apiClient.get('/products/low-stock');
    return data;
  },

  create: async (payload) => {
    const { data } = await apiClient.post('/products', payload);
    return data;
  },

  update: async (id, payload) => {
    try {
      const { data } = await apiClient.put(`/products/${id}`, payload);
      return data;
    } catch (error) {
      console.log('UPDATE ERROR:', error.response?.data);
      throw error;
    }
  },

  deactivate: async (id) => {
    const { data } = await apiClient.patch(`/products/${id}/deactivate`);
    return data;
  },

  delete: async (id) => {
    await apiClient.delete(`/products/${id}`);
  },

  // Don't manually set Content-Type for FormData — Axios auto-sets multipart/form-data
  // with the correct boundary. Passing a headers object here merges incorrectly and
  // can drop the Authorization header set by the interceptor.
  uploadImages: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));
    const { data } = await apiClient.post('/products/upload-images', formData);
    return data.data; // [{ url, publicId, altText }]
  },

  deleteImage: async (publicId) => {
    await apiClient.delete(`/products/upload-images/${encodeURIComponent(publicId)}`);
  },
};