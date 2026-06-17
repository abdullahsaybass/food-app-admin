// features/category/components/DeleteConfirmModal.jsx
import styles from "./DeleteConfirmModal.module.css";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, submitting, categoryName }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.icon}>🗑️</div>
        <h3 className={styles.title}>Delete Category</h3>
        <p className={styles.message}>
          Are you sure you want to delete <strong>"{categoryName}"</strong>?
          This action cannot be undone and may affect products linked to this category.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={onConfirm} disabled={submitting}>
            {submitting ? <span className={styles.spinner} /> : null}
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;