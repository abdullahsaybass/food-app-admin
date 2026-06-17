// src/features/product/hooks/useProductStats.js

import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../core/api/httpClient.js';
import { inventoryApi } from '../api/inventory.api.js';
import { fetchCategories } from '../../catergory/api/category.api.js';

// All five numbers come from real endpoints — no client-side guessing:
//  - total / active: GET /products with limit=1, reading pagination.total
//    (isActive filter is genuinely supported server-side per product.service.js)
//  - outOfStock / lowStock: GET /inventory/out-of-stock and /inventory/low-stock
//  - totalCategories: GET /categories?activeOnly=false, counting the array
async function fetchProductStats() {
  const [totalRes, activeRes, outOfStock, lowStock, categoriesRes] = await Promise.all([
    apiClient.get('/products', { params: { limit: 1 } }),
    apiClient.get('/products', { params: { limit: 1, isActive: true } }),
    inventoryApi.getOutOfStock(),
    inventoryApi.getLowStock(),
    fetchCategories(false),
  ]);

  return {
    total:           totalRes.data?.data?.pagination?.total ?? 0,
    active:          activeRes.data?.data?.pagination?.total ?? 0,
    outOfStock:      outOfStock?.length ?? 0,
    lowStock:        lowStock?.length ?? 0,
    totalCategories: categoriesRes.data?.data?.length ?? 0,
  };
}

export function useProductStats() {
  return useQuery({
    queryKey: ['products', 'stats'],
    queryFn:  fetchProductStats,
  });
}