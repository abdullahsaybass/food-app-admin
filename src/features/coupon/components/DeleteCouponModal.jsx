// features/coupon/components/DeleteCouponModal.jsx
import styles from "./DeleteCouponModal.module.css";

const DeleteCouponModal = ({ isOpen, onClose, onConfirm, submitting, couponCode }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <TrashIcon />
        </div>
        <h3 className={styles.title}>Delete Coupon</h3>
        <p className={styles.body}>
          Are you sure you want to delete coupon <strong>{couponCode}</strong>?
          This action cannot be undone.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={onConfirm} disabled={submitting}>
            {submitting ? <span className={styles.spinner} /> : null}
            Delete Coupon
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCouponModal;

function TrashIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
