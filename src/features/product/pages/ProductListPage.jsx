// src/features/products/pages/ProductListPage.jsx

import { useState, useMemo, useCallback } from 'react';
import { useProducts, useDeleteProduct, useDeactivateProduct } from '../hooks/useProduct.js';
import { ProductFormModal } from '../components/ProductFormModal';
import { ProductDetailPanel } from '../components/ProductDetailPanel';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import './ProductListPage.css';

const ALL_CATEGORY = 'All';

export default function ProductListPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const params = useMemo(() => ({
    page,
    limit: 10,
    search: search || undefined,
    category: category !== ALL_CATEGORY ? category : undefined,
  }), [page, search, category]);

    const { data, isLoading, isError } = useProducts(params);

    const deleteProduct = useDeleteProduct();
    const deactivateProduct = useDeactivateProduct();

    // ✅ FIX
    const products = data?.products ?? [];
    const pagination = data?.pagination;

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return [ALL_CATEGORY, ...Array.from(cats)];
  }, [products]);

  const getPrimaryVariant = (product) => product.variants?.[0] ?? {};
  const getTotalStock = (product) =>
    product.totalStock ?? (product.variants ?? []).reduce((sum, variant) => sum + (variant.quantity ?? 0), 0);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleDeactivate = useCallback(async (product) => {
    setOpenMenuId(null);
    await deactivateProduct.mutateAsync(product.id);
  }, [deactivateProduct]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteProduct.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    if (selectedProduct?.id === deleteTarget.id) setSelectedProduct(null);
  }, [deleteTarget, deleteProduct, selectedProduct]);

  return (
    <div className="plp-wrap" onClick={() => setOpenMenuId(null)}>

      {/* ── Top bar ── */}
      <div className="plp-topbar">
        <div className="plp-topbar-left">
          <h1 className="plp-title">Product Lists</h1>
          {pagination && (
            <span className="plp-count">{pagination.total} items</span>
          )}
        </div>
        <div className="plp-topbar-right">
          <div className="plp-search">
            <SearchIcon />
            <input
              placeholder="Type product name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button className="plp-filter-btn">
            <FilterIcon /> Filter
          </button>
          <button className="plp-add-btn" onClick={() => setShowCreateModal(true)}>
            <PlusIcon /> Add Products
          </button>
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="plp-cats">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`plp-cat-btn ${category === cat ? 'plp-cat-btn--active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="plp-body">
        <div className="plp-table-wrap">

          {isError && (
            <div className="plp-error">Failed to load products. Please try again.</div>
          )}

          <table className="plp-table">
            <thead>
              <tr>
                <th><input type="checkbox" className="plp-checkbox" /></th>
                <th>Product Name <SortIcon /></th>
                <th>Price <SortIcon /></th>
                <th>SKU</th>
                <th>Quantity <SortIcon /></th>
                <th>Category <SortIcon /></th>
                <th>Status <SortIcon /></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="plp-row plp-row--skeleton">
                      <td><div className="skel skel-sm" /></td>
                      <td>
                        <div className="plp-name-cell">
                          <div className="skel skel-avatar" />
                          <div className="skel skel-lg" />
                        </div>
                      </td>
                      <td><div className="skel skel-md" /></td>
                      <td><div className="skel skel-md" /></td>
                      <td><div className="skel skel-sm" /></td>
                      <td><div className="skel skel-md" /></td>
                      <td><div className="skel skel-sm" /></td>
                      <td />
                    </tr>
                  ))
                : products.map((product) => (
                    <tr
                      key={product.id}
                      className={`plp-row ${selectedProduct?.id === product.id ? 'plp-row--selected' : ''}`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="plp-checkbox" />
                      </td>
                      <td>
                        <div className="plp-name-cell">
                          <div className="plp-avatar">
                           {product.images?.[0]?.url
                              ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.images[0].altText || product.name}
                                  />
                                )
                              : <span>{product.name[0]}</span>
                            }
                          </div>
                          <div>
                            <p className="plp-product-name">{product.name}</p>
                            <p className="plp-product-sku">SKU: #{getPrimaryVariant(product).sku ?? 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="plp-price">${(getPrimaryVariant(product).price ?? 0).toFixed(2)}</td>
                      <td className="plp-sku">{getPrimaryVariant(product).sku ?? 'N/A'}</td>
                      <td>
                        <span className={`plp-qty ${product.isLowStock ? 'plp-qty--low' : ''}`}>
                          {getTotalStock(product)} {getPrimaryVariant(product).unit ?? 'pcs'}
                          {product.isLowStock && <span className="plp-low-badge">Low</span>}
                        </span>
                      </td>
                      <td>
                        <span className="plp-category">{product.category}</span>
                      </td>
                      <td>
                        <span className={`plp-status ${product.isActive ? 'plp-status--active' : 'plp-status--inactive'}`}>
                          <span className="plp-status-dot" />
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="plp-menu-wrap">
                          <button
                            className="plp-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === product.id ? null : product.id);
                            }}
                          >
                            <DotsIcon />
                          </button>
                          {openMenuId === product.id && (
                            <div className="plp-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => { setEditProduct(product); setOpenMenuId(null); }}>
                                <EditIcon /> Edit
                              </button>
                              <button onClick={() => { setSelectedProduct(product); setOpenMenuId(null); }}>
                                <EyeIcon /> View Details
                              </button>
                              <button onClick={() => handleDeactivate(product)}>
                                <PowerIcon /> {product.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                className="plp-menu-danger"
                                onClick={() => { setDeleteTarget(product); setOpenMenuId(null); }}
                              >
                                <TrashIcon /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="plp-pagination">
              <span className="plp-page-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="plp-page-btns">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={page === p ? 'plp-page-active' : ''}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Detail Panel ── */}
        {selectedProduct && (
          <ProductDetailPanel
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onEdit={() => { setEditProduct(selectedProduct); setSelectedProduct(null); }}
            onDeactivate={() => handleDeactivate(selectedProduct)}
            onDelete={() => { setDeleteTarget(selectedProduct); setSelectedProduct(null); }}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {showCreateModal && (
        <ProductFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
        />
      )}
      {editProduct && (
        <ProductFormModal
          mode="edit"
          product={editProduct}
          onClose={() => setEditProduct(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          productName={deleteTarget.name}
          isLoading={deleteProduct.isPending}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* ── Icons ── */
function SearchIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function FilterIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
}
function SortIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg>;
}
function DotsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}
function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function EyeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function PowerIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}