// src/features/product/api/inventory.api.js

import apiClient from '../../../core/api/httpClient.js';

export const inventoryApi = {
  // GET /api/inventory/:productId → ProductStockDTO
  getProductStock: async (productId) => {
    const { data } = await apiClient.get(`/inventory/${productId}`);
    return data.data;
  },

  // GET /api/inventory/low-stock → ProductStockDTO[]
  getLowStock: async () => {
    const { data } = await apiClient.get('/inventory/low-stock');
    return data.data;
  },

  // GET /api/inventory/out-of-stock → ProductStockDTO[]
  getOutOfStock: async () => {
    const { data } = await apiClient.get('/inventory/out-of-stock');
    return data.data;
  },

  // PATCH /api/inventory/:productId/adjust  Body: { unit, delta, note? }
  adjustStock: async (productId, { unit, delta, note }) => {
    const { data } = await apiClient.patch(`/inventory/${productId}/adjust`, { unit, delta, note });
    return data.data;
  },

  // PATCH /api/inventory/:productId/set  Body: { unit, quantity, note? }
  setStock: async (productId, { unit, quantity, note }) => {
    const { data } = await apiClient.patch(`/inventory/${productId}/set`, { unit, quantity, note });
    return data.data;
  },

  // PATCH /api/inventory/:productId/threshold  Body: { unit, threshold }
  updateThreshold: async (productId, { unit, threshold }) => {
    const { data } = await apiClient.patch(`/inventory/${productId}/threshold`, { unit, threshold });
    return data.data;
  },

  // POST /api/inventory/bulk  Body: { updates: [{ productId, unit, quantity }] }
  bulkSetStock: async (updates) => {
    const { data } = await apiClient.post('/inventory/bulk', { updates });
    return data.data;
  },
};