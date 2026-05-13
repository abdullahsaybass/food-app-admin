// features/orders/hooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/api.js";
import { useError } from "../../../app/providers/ErrorProvider.jsx";

export const ORDER_KEYS = {
  all:         ["orders"],
  adminList:   (params) => ["orders", "admin", "list", params],
  adminStats:  ["orders", "admin", "stats"],
  adminRecent: (limit)  => ["orders", "admin", "recent", limit],
  userList:    (params) => ["orders", "user", "list", params],
  detail:      (id)     => ["orders", "detail", id],
};
 
// ── Admin: all orders ─────────────────────────────────────────────────────────
export const useAdminOrders = (params = {}) => {
  const { setError } = useError();
  return useQuery({
    queryKey: ORDER_KEYS.adminList(params),
    queryFn:  () => ordersApi.admin.getAll(params),
    onError:  setError,
  });
};
 
// ── Admin: dashboard stats ────────────────────────────────────────────────────
export const useOrderStats = () => {
  const { setError } = useError();
  return useQuery({
    queryKey: ORDER_KEYS.adminStats,
    queryFn:  ordersApi.admin.getStats,
    onError:  setError,
  });
};
 
// ── Admin: recent orders ──────────────────────────────────────────────────────
export const useRecentOrders = (limit = 10) => {
  const { setError } = useError();
  return useQuery({
    queryKey: ORDER_KEYS.adminRecent(limit),
    queryFn:  () => ordersApi.admin.getRecent({ limit }),
    onError:  setError,
  });
};
 
// ── Shared: single order ──────────────────────────────────────────────────────
export const useOrder = (id) => {
  const { setError } = useError();
  return useQuery({
    queryKey: ORDER_KEYS.detail(id),
    queryFn:  () => ordersApi.getById(id),
    enabled:  !!id,
    onError:  setError,
  });
};
 
// ── Admin: update status ──────────────────────────────────────────────────────
export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  const { setError } = useError();
  return useMutation({
    mutationFn: ordersApi.admin.updateStatus,
    onSuccess:  (_, { id }) => {
      qc.invalidateQueries({ queryKey: ORDER_KEYS.all });
      qc.invalidateQueries({ queryKey: ORDER_KEYS.detail(id) });
    },
    onError: setError,
  });
};
 
// ── Admin: cancel order ───────────────────────────────────────────────────────
export const useAdminCancelOrder = () => {
  const qc = useQueryClient();
  const { setError } = useError();
  return useMutation({
    mutationFn: ordersApi.admin.cancel,
    onSuccess:  (_, { id }) => {
      qc.invalidateQueries({ queryKey: ORDER_KEYS.all });
      qc.invalidateQueries({ queryKey: ORDER_KEYS.detail(id) });
    },
    onError: setError,
  });
};
 
// ── User: own order history ───────────────────────────────────────────────────
export const useOrderHistory = (params = {}) => {
  const { setError } = useError();
  return useQuery({
    queryKey: ORDER_KEYS.userList(params),
    queryFn:  () => ordersApi.getHistory(params),
    onError:  setError,
  });
};
 