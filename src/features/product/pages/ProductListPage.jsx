// src/features/products/pages/ProductListPage.jsx

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useDeleteProduct, useDeactivateProduct } from '../hooks/useProduct.js';
import { useProductStats } from '../hooks/useProductStats.js';
import { fetchCategories } from '../../catergory/api/category.api.js';
import { ProductDetailPanel } from '../components/ProductDetailPanel';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import './ProductListPage.css';

const ALL_CATEGORY = 'All';

// Stock Status maps to real backend filters:
//  - "low_stock"  → lowStock=true   (backend-applied, product.service.js)
//  - "out_of_stock" / "in_stock" → not supported server-side (inStock param
//    exists in the Joi schema but is never read in product.service.js), so
//    these two are filtered client-side on the currently loaded page only.
const STOCK_STATUS_OPTIONS = [
  { value: '',             label: 'All' },
  { value: 'in_stock',     label: 'In Stock' },
  { value: 'low_stock',    label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

const STATUS_OPTIONS = [
  { value: '',      label: 'All Status' },
  { value: 'true',  label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const FEATURED_OPTIONS = [
  { value: '',      label: 'All' },
  { value: 'true',  label: 'Featured' },
  { value: 'false', label: 'Not Featured' },
];

function exportProductsToCSV(products) {
  const header = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Featured', 'Created At'];
  const rows = products.map((p) => {
    const v = p.variants?.[0] ?? {};
    const totalStock = p.totalStock ?? (p.variants ?? []).reduce((sum, variant) => sum + (variant.quantity ?? 0), 0);
    return [
      p.name,
      v.sku ?? 'N/A',
      p.category?.name ?? 'Uncategorized',
      v.price ?? 0,
      totalStock,
      p.isActive ? 'Active' : 'Inactive',
      p.featured ? 'Yes' : 'No',
      p.createdAt ? new Date(p.createdAt).toISOString() : '',
    ];
  });
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ProductListPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [statusFilter, setStatusFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // All categories (for the filter dropdown + tabs) — fetched independently
  // of the product list so it isn't limited to categories on the current page.
  const [allCategories, setAllCategories] = useState([]);
  useEffect(() => {
    fetchCategories(false)
      .then((res) => setAllCategories(res.data?.data ?? []))
      .catch(() => setAllCategories([]));
  }, []);

  const params = useMemo(() => ({
    page,
    limit: 10,
    search: search || undefined,
    category: category !== ALL_CATEGORY ? category : undefined,
    isActive: statusFilter !== '' ? statusFilter === 'true' : undefined,
    featured: featuredFilter !== '' ? featuredFilter === 'true' : undefined,
    // Only "low_stock" is a real backend filter (see product.service.js).
    lowStock: stockStatusFilter === 'low_stock' ? true : undefined,
  }), [page, search, category, statusFilter, featuredFilter, stockStatusFilter]);

    const { data, isLoading, isError } = useProducts(params);
    const { data: stats } = useProductStats();

    const deleteProduct = useDeleteProduct();
    const deactivateProduct = useDeactivateProduct();

    // ✅ FIX
    const rawProducts = data?.products ?? [];
    const pagination = data?.pagination;

    const getTotalStock = (product) =>
      product.totalStock ?? (product.variants ?? []).reduce((sum, variant) => sum + (variant.quantity ?? 0), 0);
    const getStockStatus = (product) => {
      const variants = product.variants ?? [];
      if (variants.length === 0) return 'in_stock';
      if (variants.every((v) => v.quantity === 0)) return 'out_of_stock';
      if (variants.some((v) => v.quantity > 0 && v.quantity <= (v.stockThreshold ?? 10))) return 'low_stock';
      return 'in_stock';
    };

    // "in_stock" / "out_of_stock" aren't backend-filterable (see note above),
    // so we apply them client-side on the current page only. "low_stock" is
    // already filtered server-side via the lowStock param, so it's a no-op here.
    const products = useMemo(() => {
      if (stockStatusFilter === 'in_stock' || stockStatusFilter === 'out_of_stock') {
        return rawProducts.filter((p) => getStockStatus(p) === stockStatusFilter);
      }
      return rawProducts;
    }, [rawProducts, stockStatusFilter]);

  const categories = useMemo(() => ([
    { id: ALL_CATEGORY, name: ALL_CATEGORY },
    ...allCategories.map((c) => ({ id: c.id ?? c._id, name: c.name })),
  ]), [allCategories]);

  const getPrimaryVariant = (product) => product.variants?.[0] ?? {};

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory(ALL_CATEGORY);
    setStatusFilter('');
    setStockStatusFilter('');
    setFeaturedFilter('');
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
          <h1 className="plp-title">All Products</h1>
          <p className="plp-subtitle">Manage all your products, inventory, pricing and status.</p>
        </div>
        <div className="plp-topbar-right">
          <button className="plp-export-btn" onClick={() => exportProductsToCSV(products)}>
            <ExportIcon /> Export
          </button>
          <button className="plp-add-btn" onClick={() => navigate('/products/add')}>
            <PlusIcon /> Add Product
          </button>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="plp-stats">
        <div className="plp-stat-card">
          <div className="plp-stat-icon plp-stat-icon--blue"><BoxIcon /></div>
          <div>
            <p className="plp-stat-label">Total Products</p>
            <p className="plp-stat-value">{stats?.total ?? '—'}</p>
            <p className="plp-stat-sub">All products</p>
          </div>
        </div>
        <div className="plp-stat-card">
          <div className="plp-stat-icon plp-stat-icon--indigo"><BriefcaseIcon /></div>
          <div>
            <p className="plp-stat-label">Active Products</p>
            <p className="plp-stat-value">{stats?.active ?? '—'}</p>
            <p className="plp-stat-sub">Currently active</p>
          </div>
        </div>
        <div className="plp-stat-card">
          <div className="plp-stat-icon plp-stat-icon--purple"><TagIcon /></div>
          <div>
            <p className="plp-stat-label">Out of Stock</p>
            <p className="plp-stat-value">{stats?.outOfStock ?? '—'}</p>
            <p className="plp-stat-sub">Not available</p>
          </div>
        </div>
        <div className="plp-stat-card">
          <div className="plp-stat-icon plp-stat-icon--amber"><AlertIcon /></div>
          <div>
            <p className="plp-stat-label">Low Stock</p>
            <p className="plp-stat-value">{stats?.lowStock ?? '—'}</p>
            <p className="plp-stat-sub">Stock running low</p>
          </div>
        </div>
        <div className="plp-stat-card">
          <div className="plp-stat-icon plp-stat-icon--teal"><LayersIcon /></div>
          <div>
            <p className="plp-stat-label">Total Categories</p>
            <p className="plp-stat-value">{stats?.totalCategories ?? '—'}</p>
            <p className="plp-stat-sub">All categories</p>
          </div>
        </div>
      </div>

      {/* ── Filters row ── */}
      <div className="plp-filters-row">
        <div className="plp-search">
          <SearchIcon />
          <input
            placeholder="Search by product name, SKU, barcode..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="plp-filter-group">
          <label className="plp-filter-label">Category</label>
          <select
            className="plp-filter-select"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.id === ALL_CATEGORY ? 'All Categories' : cat.name}</option>
            ))}
          </select>
        </div>

        <div className="plp-filter-group">
          <label className="plp-filter-label">Status</label>
          <select
            className="plp-filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="plp-filter-group">
          <label className="plp-filter-label">Stock Status</label>
          <select
            className="plp-filter-select"
            value={stockStatusFilter}
            onChange={(e) => { setStockStatusFilter(e.target.value); setPage(1); }}
          >
            {STOCK_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="plp-filter-group">
          <label className="plp-filter-label">Featured</label>
          <select
            className="plp-filter-select"
            value={featuredFilter}
            onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }}
          >
            {FEATURED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <button className="plp-reset-btn" onClick={handleResetFilters}>Reset</button>
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
                <th>Product <SortIcon /></th>
                <th>SKU / Barcode</th>
                <th>Category <SortIcon /></th>
                <th>Price <SortIcon /></th>
                <th>Stock <SortIcon /></th>
                <th>Status <SortIcon /></th>
                <th>Stock Status</th>
                <th>Featured</th>
                <th>Created At</th>
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
                      <td><div className="skel skel-sm" /></td>
                      <td><div className="skel skel-md" /></td>
                      <td><div className="skel skel-md" /></td>
                      <td><div className="skel skel-sm" /></td>
                      <td><div className="skel skel-md" /></td>
                      <td />
                    </tr>
                  ))
                : products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const stockStatusLabel = { in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' }[stockStatus];
                    return (
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
                            <p className="plp-product-sku">{getPrimaryVariant(product).unit ?? ''}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="plp-sku">SKU: {getPrimaryVariant(product).sku ?? 'N/A'}</p>
                      </td>
                      <td>
                        <span className="plp-category">{product.category?.name ?? 'Uncategorized'}</span>
                      </td>
                      <td className="plp-price">${(getPrimaryVariant(product).price ?? 0).toFixed(2)}</td>
                      <td>
                        <span className={`plp-qty ${stockStatus !== 'in_stock' ? 'plp-qty--low' : ''}`}>
                          {getTotalStock(product)} {getPrimaryVariant(product).unit ?? 'pcs'}
                        </span>
                      </td>
                      <td>
                        <span className={`plp-status ${product.isActive ? 'plp-status--active' : 'plp-status--inactive'}`}>
                          <span className="plp-status-dot" />
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className={`plp-stockstatus plp-stockstatus--${stockStatus}`}>
                          {stockStatusLabel}
                        </span>
                      </td>
                      <td>
                        <span className={`plp-featured ${product.featured ? 'plp-featured--yes' : 'plp-featured--no'}`}>
                          {product.featured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="plp-created">
                        {product.createdAt
                          ? new Date(product.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
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
                              <button onClick={() => { navigate(`/products/${product.id}/edit`); setOpenMenuId(null); }}>
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
                    );
                  })
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
            onEdit={() => navigate(`/products/${selectedProduct.id}/edit`)}
            onDeactivate={() => handleDeactivate(selectedProduct)}
            onDelete={() => { setDeleteTarget(selectedProduct); setSelectedProduct(null); }}
          />
        )}
      </div>

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
function ExportIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function BoxIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}
function BriefcaseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>;
}
function TagIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}
function AlertIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function LayersIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
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