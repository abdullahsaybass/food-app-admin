// features/orders/components/UpdateStatusModal.jsx
import { useState } from "react";
import { STATUS_TRANSITIONS, ORDER_STATUS_LABELS } from "../types";
import { useUpdateOrderStatus } from "../hooks/orderAuth.js";
import { normalizeError } from "../../../shared/lib/error-handler.js";
import styles from "./UpdateStatusModal.module.css";

export default function UpdateStatusModal({ order, onClose }) {
  const allowed = STATUS_TRANSITIONS[order.status] ?? [];
  const [status, setStatus] = useState(allowed[0] ?? "");

  const { mutate, isPending, error } = useUpdateOrderStatus();
  const localError = error ? normalizeError(error) : null;

  const handleSubmit = () => {
    if (!status) return;
    mutate({ id: order.id, status }, { onSuccess: onClose });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <h3 className={styles.title}>Update Order Status</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <p className={styles.meta}>
          Order <span className={styles.orderId}>#{order.id?.slice(-8).toUpperCase()}</span>
          &nbsp;·&nbsp;Current:&nbsp;
          <strong>{ORDER_STATUS_LABELS[order.status] ?? order.status}</strong>
        </p>

        {localError && (
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <div>
              <p className={styles.errorMsg}>{localError.message}</p>
              {localError.errors?.map((e, i) => (
                <p key={i} className={styles.errorSub}>{e}</p>
              ))}
            </div>
          </div>
        )}

        {allowed.length === 0 ? (
          <p className={styles.noTransition}>No further status transitions available.</p>
        ) : (
          <>
            <div className={styles.options}>
              {allowed.map((s) => (
                <label
                  key={s}
                  className={`${styles.option} ${status === s ? styles.active : ""}`}
                  onClick={() => setStatus(s)}
                >
                  <span className={`${styles.optionDot} ${status === s ? styles.activeDot : ""}`} />
                  {ORDER_STATUS_LABELS[s] ?? s}
                </label>
              ))}
            </div>

            <div className={styles.footer}>
              <button className={styles.cancelBtn} onClick={onClose} disabled={isPending}>
                Cancel
              </button>
              <button className={styles.submitBtn} onClick={handleSubmit} disabled={isPending || !status}>
                {isPending ? "Updating…" : "Confirm"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}