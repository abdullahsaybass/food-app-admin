// src/features/product/hooks/useProduct.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/api.js';

export const PRODUCT_KEYS = {
  all:      ['products'],
  list:     (params) => ['products', 'list', params],
  detail:   (id)     => ['products', id],
  lowStock: ()       => ['products', 'low-stock'],
};

export function useProducts(params) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn:  () => productApi.list(params),
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn:  () => productApi.getById(id),
    enabled:  !!id,
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: PRODUCT_KEYS.lowStock(),
    queryFn:  productApi.getLowStock,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => productApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => productApi.update(id, payload),
    onSuccess:  (_, { id }) => {
      qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      qc.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(id) });
    },
  });
}

export function useDeactivateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productApi.deactivate(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => productApi.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all }),
  });
}

// 🔥 Upload files → saved to local disk via backend
// mutateAsync(files: File[]) → [{ url, publicId, altText }]
export function useUploadImages() {
  return useMutation({
    mutationFn: (files) => productApi.uploadImages(files),
  });
}

// 🔥 Delete a single image from server storage
// mutateAsync(publicId: string)
export function useDeleteImage() {
  return useMutation({
    mutationFn: (publicId) => productApi.deleteImage(publicId),
  });
}