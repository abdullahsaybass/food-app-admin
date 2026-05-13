// src/features/products/components/DeleteConfirmModal.jsx

import './DeleteConfirmModal.css';

export function DeleteConfirmModal({ productName, isLoading, onConfirm, onCancel }) {
  return (
    <div className="dcm-overlay" onClick={onCancel}>
      <div className="dcm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dcm-icon-wrap">
          <TrashIcon />
        </div>
        <h3 className="dcm-title">Delete Product</h3>
        <p className="dcm-desc">
          Are you sure you want to delete <strong>{productName}</strong>?
          This action cannot be undone.
        </p>
        <div className="dcm-actions">
          <button className="dcm-btn dcm-btn--cancel" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button className="dcm-btn dcm-btn--delete" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  );
}