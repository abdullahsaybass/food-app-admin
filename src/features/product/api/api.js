// src/features/products/api.js

import apiClient from '../../../core/api/httpClient.js';

// src/features/products/api.js

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
    const { data } = await apiClient.put(`/products/${id}`, payload);
    return data;
  },

  deactivate: async (id) => {
    const { data } = await apiClient.patch(`/products/${id}/deactivate`);
    return data;
  },

  delete: async (id) => {
    await apiClient.delete(`/products/${id}`);
  },

  // 🔥 Upload images from computer → Cloudinary
  // files: FileList or File[]
  // returns: [{ url, publicId, altText }]
  uploadImages: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));
    const { data } = await apiClient.post('/products/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data; // [{ url, publicId, altText }]
  },

  // 🔥 Delete a single image from Cloudinary
  deleteImage: async (publicId) => {
    await apiClient.delete(`/products/upload-images/${encodeURIComponent(publicId)}`);
  },
};