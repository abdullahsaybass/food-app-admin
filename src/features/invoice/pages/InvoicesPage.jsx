// features/invoice/pages/InvoicesPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminInvoices } from "../hooks/invoiceAuth.js";
import { normalizeError } from "../../../shared/lib/error-handler.js";
import styles from "./InvoicesPage.module.css";

const isLocalError = (code) => code && code !== 401 && code !== 403 && code < 500;

export default function InvoicesPage() {
  const navigate = useNavigate();

  const [search,      setSearch]      = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status,      setStatus]      = useState("");
  const [page,        setPage]        = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params = {
    page,
    limit: 20,
    ...(status && { status }),
    ...(search && { search }),
  };

  const { data, isLoading, error } = useAdminInvoices(params);

  const localError = error && isLocalError(error?.response?.status) ? normalizeError(error) : null;
  const invoices   = data?.data?.invoices   ?? [];
  const pagination = data?.data?.pagination ?? {};

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Invoices</h1>
          <p className={styles.sub}>View and download invoices for all orders</p>
        </div>
      </div>

      {localError && (
        <div className={styles.errorBox}>
          <span>⚠️</span>
          <p className={styles.errorMsg}>{localError.message}</p>
        </div>
      )}

      {/* ── Filters ── */}
      <div className={styles.filtersRow}>
        <input
          className={styles.searchBox}
          placeholder="Search by invoice number…"
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
        />
        <select className={styles.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="issued">Issued</option>
          <option value="void">Void</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className={styles.card}>
        {isLoading ? (
          <div className={styles.empty}>Loading invoices…</div>
        ) : invoices.length === 0 ? (
          <div className={styles.empty}>No invoices found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                {["Invoice No.", "Customer", "Date", "Amount", "Payment", "Status", ""].map((h) => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={styles.invoiceNumber}>{inv.invoiceNumber}</span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.customerName}>{inv.user?.name ?? "—"}</div>
                    <div className={styles.customerInfo}>{inv.user?.phone ?? ""}</div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.date}>
                      {new Date(inv.issuedAt ?? inv.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.amount}>MVR {inv.totalAmount?.toFixed(2)}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.badge} data-tone={inv.paymentStatus === "refunded" ? "red" : inv.paymentMethod?.toUpperCase() === "COD" ? "yellow" : "green"}>
                      {inv.paymentStatus === "refunded" ? "Refunded" : inv.paymentMethod?.toUpperCase() === "COD" ? "COD" : "Online"}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.badge} data-tone={inv.status === "void" ? "red" : "blue"}>
                      {inv.statusLabel ?? inv.status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button className={styles.viewBtn} onClick={() => navigate(`/invoice/${inv.id}`)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span className={styles.pageInfo}>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} invoices
          </span>
          <button className={styles.pageBtn} disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}