// src/features/products/components/ProductDetailPanel.jsx

import './ProductDetailPanel.css';

export function ProductDetailPanel({ product, onClose, onEdit, onDeactivate, onDelete }) {
  const stockPercent = Math.min(
    100,
    Math.round((product.quantity / (product.stockThreshold * 5)) * 100)
  );

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <aside className="pdp">

      {/* Header */}
      <div className="pdp-header-bar">
        <h3 className="pdp-header-title">Product Details</h3>
        <button className="pdp-close" onClick={onClose}><CloseIcon /></button>
      </div>

      {/* Image */}
      <div className="pdp-img-wrap">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="pdp-img" />
          : (
            <div className="pdp-img-placeholder">
              <ImageIcon />
              <span>No Image</span>
            </div>
          )
        }
        <span className={`pdp-status-badge ${product.isActive ? 'pdp-status-badge--active' : 'pdp-status-badge--inactive'}`}>
          <span className="pdp-status-dot" />
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Scrollable info */}
      <div className="pdp-info">

        {/* Name + category */}
        <div className="pdp-name-row">
          <div>
            <h2 className="pdp-name">{product.name}</h2>
            <p className="pdp-sku">SKU: {product.sku}</p>
          </div>
          <span className="pdp-category-tag">{product.category}</span>
        </div>

        {/* Price */}
        <div className="pdp-price-section">
          <span className="pdp-price">${product.price.toFixed(2)}</span>
          <span className="pdp-price-label">/ {product.unit}</span>
        </div>

        {/* Description */}
        <div className="pdp-section">
          <h4 className="pdp-section-title">Description</h4>
          <p className="pdp-desc">{product.description || 'No description provided.'}</p>
        </div>

        {/* Stock */}
        <div className="pdp-section">
          <h4 className="pdp-section-title">Stock Information</h4>
          <div className="pdp-stock-grid">
            <div className="pdp-stock-item">
              <span className="pdp-stock-label">Current Stock</span>
              <span className={`pdp-stock-value ${product.isLowStock ? 'pdp-stock-value--low' : ''}`}>
                {product.quantity} {product.unit}
              </span>
            </div>
            <div className="pdp-stock-item">
              <span className="pdp-stock-label">Low Stock Alert</span>
              <span className="pdp-stock-value">{product.stockThreshold} {product.unit}</span>
            </div>
          </div>
          <div className="pdp-stock-bar-wrap">
            <div className="pdp-stock-bar">
              <div
                className={`pdp-stock-bar-fill ${product.isLowStock ? 'pdp-stock-bar-fill--low' : ''}`}
                style={{ width: `${stockPercent}%` }}
              />
            </div>
            {product.isLowStock && (
              <span className="pdp-low-alert">⚠ Low stock — reorder soon</span>
            )}
          </div>
        </div>

        {/* Audit info */}
        <div className="pdp-section">
          <h4 className="pdp-section-title">Audit Info</h4>
          <div className="pdp-meta">
            <div className="pdp-meta-row">
              <span className="pdp-meta-label">Created by</span>
              <span className="pdp-meta-value">{product.createdBy}</span>
            </div>
            <div className="pdp-meta-row">
              <span className="pdp-meta-label">Last updated by</span>
              <span className="pdp-meta-value">{product.updatedBy ?? '—'}</span>
            </div>
            <div className="pdp-meta-row">
              <span className="pdp-meta-label">Created at</span>
              <span className="pdp-meta-value">{formatDate(product.createdAt)}</span>
            </div>
            <div className="pdp-meta-row">
              <span className="pdp-meta-label">Updated at</span>
              <span className="pdp-meta-value">{formatDate(product.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="pdp-actions">
        <button className="pdp-btn pdp-btn--edit" onClick={onEdit}>
          <EditIcon /> Edit Product
        </button>
        <button
          className={`pdp-btn ${product.isActive ? 'pdp-btn--deactivate' : 'pdp-btn--activate'}`}
          onClick={onDeactivate}
        >
          <PowerIcon /> {product.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button className="pdp-btn pdp-btn--delete" onClick={onDelete}>
          <TrashIcon /> Delete
        </button>
      </div>

    </aside>
  );
}

/* Icons */
function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function ImageIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
}
function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function PowerIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}