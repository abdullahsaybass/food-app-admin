// src/features/product/hooks/useInventory.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api.js';
import { PRODUCT_KEYS } from './useProduct.js';

export const INVENTORY_KEYS = {
  all:        ['inventory'],
  stock:      (productId) => ['inventory', productId],
  lowStock:   ['inventory', 'low-stock'],
  outOfStock: ['inventory', 'out-of-stock'],
};

export function useProductStock(productId) {
  return useQuery({
    queryKey: INVENTORY_KEYS.stock(productId),
    queryFn:  () => inventoryApi.getProductStock(productId),
    enabled:  !!productId,
  });
}

export function useLowStockInventory() {
  return useQuery({
    queryKey: INVENTORY_KEYS.lowStock,
    queryFn:  inventoryApi.getLowStock,
  });
}

export function useOutOfStockInventory() {
  return useQuery({
    queryKey: INVENTORY_KEYS.outOfStock,
    queryFn:  inventoryApi.getOutOfStock,
  });
}

// Invalidate everything that could show stale stock numbers after any write
function invalidateStock(qc, productId) {
  qc.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
  qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
  if (productId) qc.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(productId) });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, unit, delta, note }) =>
      inventoryApi.adjustStock(productId, { unit, delta, note }),
    onSuccess: (_, { productId }) => invalidateStock(qc, productId),
  });
}

export function useSetStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, unit, quantity, note }) =>
      inventoryApi.setStock(productId, { unit, quantity, note }),
    onSuccess: (_, { productId }) => invalidateStock(qc, productId),
  });
}

export function useUpdateThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, unit, threshold }) =>
      inventoryApi.updateThreshold(productId, { unit, threshold }),
    onSuccess: (_, { productId }) => invalidateStock(qc, productId),
  });
}

export function useBulkSetStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates) => inventoryApi.bulkSetStock(updates),
    onSuccess: () => invalidateStock(qc),
  });
}