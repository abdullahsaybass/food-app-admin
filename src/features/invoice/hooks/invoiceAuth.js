// features/invoice/hooks/invoiceAuth.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceApi } from "../api/invoice.api.js";
import { useError } from "../../../app/providers/ErrorProvider.jsx";

export const INVOICE_KEYS = {
  all:       ["invoices"],
  adminList: (params) => ["invoices", "admin", "list", params],
  detail:    (id)     => ["invoices", "detail", id],
};

// ── Admin: all invoices ───────────────────────────────────────────────────────
export const useAdminInvoices = (params = {}) => {
  const { setError } = useError();
  return useQuery({
    queryKey: INVOICE_KEYS.adminList(params),
    queryFn:  () => invoiceApi.admin.getAll(params),
    onError:  setError,
  });
};

// ── Shared: single invoice ────────────────────────────────────────────────────
export const useInvoice = (id) => {
  const { setError } = useError();
  return useQuery({
    queryKey: INVOICE_KEYS.detail(id),
    queryFn:  () => invoiceApi.getById(id),
    enabled:  !!id,
    onError:  setError,
  });
};

// ── Admin: void invoice ───────────────────────────────────────────────────────
export const useVoidInvoice = () => {
  const qc = useQueryClient();
  const { setError } = useError();
  return useMutation({
    mutationFn: invoiceApi.admin.void,
    onSuccess:  (_, id) => {
      qc.invalidateQueries({ queryKey: INVOICE_KEYS.all });
      qc.invalidateQueries({ queryKey: INVOICE_KEYS.detail(id) });
    },
    onError: setError,
  });
};