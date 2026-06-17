// features/orders/components/OrderStatusBadge.jsx
import { STATUS_COLORS, ORDER_STATUS_LABELS } from "../types";
import styles from "./OrderStatusBadge.module.css";

export default function OrderStatusBadge({ status }) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span className={styles.badge} style={{ backgroundColor: color.bg, color: color.text }}>
      <span className={styles.dot} style={{ backgroundColor: color.dot }} />
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}