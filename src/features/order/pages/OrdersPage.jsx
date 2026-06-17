// features/orders/pages/OrdersPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminOrders, useOrderStats } from "../hooks/orderAuth.js";
import { normalizeError } from "../../../shared/lib/error-handler.js";
import OrderStatusBadge from "../components/OrderStatusBadge";
import UpdateStatusModal from "../components/UpdateStatusModal";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "../types";
import styles from "./OrdersPage.module.css";

const STATUS_TABS   = ["all", ...Object.values(ORDER_STATUS)];
const isLocalError  = (code) => code && code !== 401 && code !== 403 && code < 500;
 
export default function OrdersPage() {
  const navigate = useNavigate();
 
  const [activeTab,      setActiveTab]      = useState("all");
  const [search,         setSearch]         = useState("");
  const [searchInput,    setSearchInput]    = useState("");
  const [paymentStatus,  setPaymentStatus]  = useState("");
  const [sortOrder,      setSortOrder]      = useState("desc");
  const [page,           setPage]           = useState(1);
  const [selectedOrder,  setSelectedOrder]  = useState(null);
 
  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);
 
  const params = {
    page,
    limit: 20,
    sortBy:    "createdAt",
    sortOrder,
    ...(activeTab !== "all" && { status: activeTab }),
    ...(paymentStatus       && { paymentStatus }),
    ...(search              && { search }),
  };
 
  const { data: ordersData, isLoading, error } = useAdminOrders(params);
  const { data: statsData }                    = useOrderStats();
 
  const localError = error && isLocalError(error?.response?.status) ? normalizeError(error) : null;
  const orders     = ordersData?.data?.orders     ?? [];
  const pagination = ordersData?.data?.pagination ?? {};
  const stats      = statsData?.data;
 
  const handleTabChange = (tab) => { setActiveTab(tab); setPage(1); };
 
  return (
    <div className={styles.page}>
 
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Orders</h1>
          <p className={styles.sub}>Manage and track all customer orders</p>
        </div>
      </div>
 
      {/* ── Stats row ── */}
      {stats && (
        <div className={styles.statsRow}>
          <StatCard label="Total Orders"   value={stats.totalOrders}   sub={`${stats.todayOrders} today`} />
          <StatCard label="Total Revenue"  value={`₹${stats.totalRevenue?.toLocaleString("en-IN")}`} />
          <StatCard label="Pending"        value={stats.pending}        sub={`${stats.confirmed} confirmed`} />
          <StatCard label="Delivered"      value={stats.delivered}      sub={`${stats.cancelled} cancelled`} />
        </div>
      )}
 
      {localError && (
        <div className={styles.errorBox}>
          <span>⚠️</span>
          <p className={styles.errorMsg}>{localError.message}</p>
        </div>
      )}
 
      {/* ── Filters row ── */}
      <div className={styles.filtersRow}>
        <input
          className={styles.searchBox}
          placeholder="Search by order no., name or phone…"
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
        />
        <select className={styles.select} value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}>
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
        <select className={styles.select} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
 
      {/* ── Status tabs ── */}
      <div className={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab === "all" ? "All" : ORDER_STATUS_LABELS[tab] ?? tab}
          </button>
        ))}
      </div>
 
      {/* ── Table ── */}
      <div className={styles.card}>
        {isLoading ? (
          <div className={styles.empty}>Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>No orders found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                {["Order No.", "Customer", "Items", "Total", "Payment", "Status", "Date", ""].map((h) => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={styles.orderNumber}>{order.orderNumber}</span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.customerName}>{order.shippingAddress?.fullName ?? order.user?.name ?? "—"}</div>
                    <div className={styles.customerInfo}>{order.shippingAddress?.phone ?? order.user?.phone ?? ""}</div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.itemCount}>{order.items?.length} item(s)</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.amount}>₹{order.totalAmount?.toFixed(2)}</span>
                  </td>
                  <td className={styles.td}>
                    <span style={{ fontSize: 12, textTransform: "capitalize", color: "#6b7280" }}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className={styles.td}>
                    <span className={styles.date}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <button className={styles.viewBtn} onClick={() => navigate(`/orders/${order.id}`)}>
                        View
                      </button>
                      <button className={styles.updateBtn} onClick={() => setSelectedOrder(order)}>
                        Update
                      </button>
                    </div>
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
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} orders
          </span>
          <button className={styles.pageBtn} disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
 
      {selectedOrder && (
        <UpdateStatusModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
 
function StatCard({ label, value, sub }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value ?? "—"}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}