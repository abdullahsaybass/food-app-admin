// features/orders/pages/OrderDetailPage.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrder } from "../hooks/orderAuth.js";
import { normalizeError } from "../../../shared/lib/error-handler.js";
import OrderStatusBadge from "../components/OrderStatusBadge";
import UpdateStatusModal from "../components/UpdateStatusModal";
import styles from "./OrderDetailPage.module.css";

const isLocalError = (code) => code && code !== 401 && code !== 403 && code < 500;
 
export default function OrderDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
 
  const { data, isLoading, error } = useOrder(id);
 
  const localError = error && isLocalError(error?.response?.status) ? normalizeError(error) : null;
  const order      = data?.data;
 
  if (isLoading) return <div className={styles.centered}>Loading order…</div>;
 
  if (localError) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate("/orders")}>← Back</button>
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>⚠️</span>
          <div>
            <p className={styles.errorMsg}>{localError.message}</p>
            {localError.errors?.map((e, i) => <p key={i} className={styles.errorSub}>{e}</p>)}
          </div>
        </div>
      </div>
    );
  }
 
  if (!order) return null;
 
  return (
    <div className={styles.page}>
 
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate("/orders")}>← Back to Orders</button>
        <div className={styles.topRight}>
          <OrderStatusBadge status={order.status} />
          <button className={styles.updateBtn} onClick={() => setShowModal(true)}>Update Status</button>
        </div>
      </div>
 
      {/* ── Header ── */}
      <div className={styles.header}>
        <h1 className={styles.heading}>
          <span className={styles.orderNumber}>{order.orderNumber}</span>
        </h1>
        <p className={styles.sub}>
          {order.user?.name && <><strong>{order.user.name}</strong> · {order.user.email} · </>}
          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
          &nbsp;·&nbsp;{order.items?.length} item(s)
        </p>
      </div>
 
      <div className={styles.grid}>
 
        {/* ── Items ── */}
        <div className={`${styles.card} ${styles.cardFull}`}>
          <h2 className={styles.cardTitle}>Items Ordered</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                {["Product", "Variant", "Unit Price", "Qty", "Subtotal"].map((h) => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={i}>
                  <td className={styles.td}><span className={styles.productName}>{item.name}</span></td>
                  <td className={styles.td}>
                    {item.unit}
                    {item.sku && <span style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF' }}>SKU: {item.sku}</span>}
                  </td>
                  <td className={styles.td}>₹{item.price?.toFixed(2)}</td>
                  <td className={styles.td}>{item.quantity}</td>
                  <td className={styles.td}><strong>₹{item.subtotal?.toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Amount</span>
            <span className={styles.totalValue}>₹{order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
 
        {/* ── Shipping Address ── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Delivery Address</h2>
          <div className={styles.addressBlock}>
            <p className={styles.addressName}>{order.shippingAddress?.fullName}</p>
            <p className={styles.addressLine}>{order.shippingAddress?.phone}</p>
            <p className={styles.addressLine}>{order.shippingAddress?.street}</p>
            <p className={styles.addressLine}>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p className={styles.addressLine}>{order.shippingAddress?.postalCode} · {order.shippingAddress?.country}</p>
            {order.shippingAddress?.label && (
              <span className={styles.labelBadge}>{order.shippingAddress.label}</span>
            )}
          </div>
        </div>
 
        {/* ── Payment & Status ── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Payment & Status</h2>
          <InfoRow label="Payment Method" value={order.paymentMethod?.toUpperCase()} />
          <InfoRow label="Payment Status" value={order.paymentStatus} capitalize />
          <InfoRow label="Order Status"   value={<OrderStatusBadge status={order.status} />} />
          {order.cancelledBy  && <InfoRow label="Cancelled By"  value={order.cancelledBy}  capitalize />}
          {order.cancelReason && <InfoRow label="Cancel Reason" value={order.cancelReason} />}
          <InfoRow
            label="Last Updated"
            value={new Date(order.statusUpdatedAt).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          />
        </div>
 
        {/* ── Status Timeline ── */}
        {order.statusTimeline?.length > 0 && (
          <div className={`${styles.card} ${styles.cardFull}`}>
            <h2 className={styles.cardTitle}>Status Timeline</h2>
            <div className={styles.timeline}>
              {[...order.statusTimeline].reverse().map((entry, i) => (
                <div key={i} className={styles.timelineItem}>
                  <span className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineStatus}>{entry.status}</div>
                    <div className={styles.timelineAt}>
                      {new Date(entry.at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                    {entry.note && <div className={styles.timelineNote}>{entry.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
 
      {showModal && <UpdateStatusModal order={order} onClose={() => setShowModal(false)} />}
    </div>
  );
}
 
function InfoRow({ label, value, capitalize }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${capitalize ? styles.capitalize : ""}`}>{value}</span>
    </div>
  );
}