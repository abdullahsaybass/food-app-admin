// features/orders/api.js
import httpClient from "../../../core/api/httpClient";

 
 
const BASE = "/orders";
 
export const ordersApi = {
  // ── User ────────────────────────────────────────────────────────────────────
  placeOrder:  (data)          => httpClient.post(BASE, data).then((r) => r.data),
  getHistory:  (params = {})   => httpClient.get(BASE, { params }).then((r) => r.data),
  getById:     (id)            => httpClient.get(`${BASE}/${id}`).then((r) => r.data),
  cancel:      ({ id, cancelReason }) =>
    httpClient.patch(`${BASE}/${id}/cancel`, { cancelReason }).then((r) => r.data),
 
  // ── Admin ───────────────────────────────────────────────────────────────────
  admin: {
    getAll:       (params = {}) => httpClient.get(`${BASE}/admin/all`,    { params }).then((r) => r.data),
    getStats:     ()            => httpClient.get(`${BASE}/admin/stats`).then((r) => r.data),
    getRecent:    (params = {}) => httpClient.get(`${BASE}/admin/recent`, { params }).then((r) => r.data),
    updateStatus: ({ id, status }) =>
      httpClient.patch(`${BASE}/${id}/status`, { status }).then((r) => r.data),
    cancel: ({ id, cancelReason }) =>
      httpClient.patch(`${BASE}/admin/${id}/cancel`, { cancelReason }).then((r) => r.data),
  },
};
 