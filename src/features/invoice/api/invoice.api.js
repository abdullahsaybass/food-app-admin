// features/invoice/api/invoice.api.js
import httpClient from "../../../core/api/httpClient";

const BASE = "/invoices";

export const invoiceApi = {
  // ── User ────────────────────────────────────────────────────────────────────
  getMyInvoices: (params = {})  => httpClient.get(BASE, { params }).then((r) => r.data),
  getById:       (id)           => httpClient.get(`${BASE}/${id}`).then((r) => r.data),
  getByOrderId:  (orderId)      => httpClient.get(`${BASE}/order/${orderId}`).then((r) => r.data),

  // ── Admin ───────────────────────────────────────────────────────────────────
  admin: {
    getAll: (params = {}) => httpClient.get(`${BASE}/admin/all`,      { params }).then((r) => r.data),
    void:   (id)          => httpClient.patch(`${BASE}/admin/${id}/void`).then((r) => r.data),
  },
};