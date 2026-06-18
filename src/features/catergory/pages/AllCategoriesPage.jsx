// features/category/pages/AllCategoriesPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCategory from "../hooks/useCategory";
import CategoryFormModal from "../components/CategoryFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { resolveImageUrl } from "../../../core/config/env";
import styles from "./AllCategoriesPage.module.css";

const PAGE_SIZE = 8;

const AllCategoriesPage = () => {
  const navigate = useNavigate();
  const {
    categories,
    loading,
    submitting,
    uploading,
    error,
    uploadImage,
    addCategory,
    editCategory,
    removeCategory,
  } = useCategory();

  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy]             = useState("sortAsc");
  const [page, setPage]                 = useState(1);
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  /* ── Toast helper ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Filter ── */
  let filtered = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.key.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && c.isActive) ||
      (statusFilter === "Inactive" && !c.isActive);
    return matchesSearch && matchesStatus;
  });

  /* ── Sort ── */
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "sortDesc":  return b.sortOrder - a.sortOrder;
      case "nameAsc":   return a.name.localeCompare(b.name);
      case "nameDesc":  return b.name.localeCompare(a.name);
      case "newest":    return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":    return new Date(a.createdAt) - new Date(b.createdAt);
      case "sortAsc":
      default:          return a.sortOrder - b.sortOrder;
    }
  });

  /* ── Pagination ── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems   = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* ── Stats ── */
  const totalCategories    = categories.length;
  const activeCategories   = categories.filter((c) => c.isActive).length;
  const inactiveCategories = totalCategories - activeCategories;
  const totalProducts      = categories.reduce((sum, c) => sum + (c.productCount ?? 0), 0);

  const openAdd = () => { setEditTarget(null); setShowForm(true); };

  const openEdit = (cat) => {
    const id = cat._id ?? cat.id;
    navigate(`/categories/${id}/edit`);
  };

  const viewProducts = (cat) => {
    const id = cat._id ?? cat.id;
    navigate(`/products?category=${id}`);
  };

  const handleFormSubmit = async ({ imageFile, existingImage, removeImage: removeImg, ...fields }) => {
    try {
      let image = existingImage ?? null;
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        image = { url: uploaded.url, publicId: uploaded.publicId ?? uploaded.public_id ?? null, altText: fields.name };
      } else if (removeImg) {
        image = null;
      }
      const payload = { ...fields, ...(image !== undefined ? { image } : {}) };
      if (editTarget) {
        await editCategory(editTarget._id ?? editTarget.id, payload);
        showToast("Category updated successfully.");
      } else {
        await addCategory(payload);
        showToast("Category created successfully.");
      }
      setShowForm(false);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async () => {
    try {
      await removeCategory(deleteTarget._id ?? deleteTarget.id);
      setDeleteTarget(null);
      showToast("Category deleted.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const date = d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return { date, time };
  };

  return (
    <div className={styles.page}>

      {/* ── Toast ── */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>All Categories</h1>
          <p className={styles.pageSub}>Manage all product categories and view their related products.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.addBtn} onClick={openAdd}>
            <span className={styles.addBtnIcon}>+</span> Add Category
          </button>
          <button className={styles.exportBtn}>
            <span className={styles.exportIcon}>⭳</span> Export
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statIconGreen}`}>🗂️</span>
          <div>
            <p className={styles.statLabel}>Total Categories</p>
            <p className={styles.statValue}>{totalCategories}</p>
            <p className={styles.statHint}>All categories</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statIconBlue}`}>📅</span>
          <div>
            <p className={styles.statLabel}>Active Categories</p>
            <p className={styles.statValue}>{activeCategories}</p>
            <p className={styles.statHint}>Currently active</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statIconPurple}`}>📅</span>
          <div>
            <p className={styles.statLabel}>Total Products</p>
            <p className={styles.statValue}>{totalProducts}</p>
            <p className={styles.statHint}>In all categories</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statIconOrange}`}>📁</span>
          <div>
            <p className={styles.statLabel}>Inactive Categories</p>
            <p className={styles.statValue}>{inactiveCategories}</p>
            <p className={styles.statHint}>Currently inactive</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.search}
            placeholder="Search categories..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className={styles.statusWrap}>
          <span className={styles.statusLabel}>Status</span>
          <select
            className={styles.statusSelect}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className={styles.toolbarRight}>
          <div className={styles.sortWrap}>
            <span className={styles.sortLabel}>Sort By</span>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="sortAsc">Sort Order (Low to High)</option>
              <option value="sortDesc">Sort Order (High to Low)</option>
              <option value="nameAsc">Name (A–Z)</option>
              <option value="nameDesc">Name (Z–A)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          <button className={styles.filtersBtn}>
            <span className={styles.filterIcon}>▾</span> Filters
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

      {/* ── Table ── */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <span className={styles.loadingSpinner} />
          <p>Loading categories…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📂</span>
          <p>{search ? "No categories match your search." : "No categories yet. Add your first one!"}</p>
          {!search && (
            <button className={styles.addBtn} onClick={openAdd}>+ Add Category</button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Key</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Sort Order</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((cat, idx) => {
                  const catId  = cat._id ?? cat.id;
                  const rowNum = (currentPage - 1) * PAGE_SIZE + idx + 1;
                  const { date, time } = formatDate(cat.createdAt);
                  return (
                    <tr key={catId} className={styles.row}>
                      <td className={styles.rowNum}>{rowNum}</td>
                      <td>
                        <div className={styles.catCell}>
                          {/* Two images side by side like the screenshot */}
                          <div className={styles.catImgs}>
                            {cat.image?.url ? (
                              <>
                                <img src={resolveImageUrl(cat.image.url)} alt={cat.name} className={styles.catImgSm} />
                                <img src={resolveImageUrl(cat.image.url)} alt={cat.name} className={styles.catImgLg} />
                              </>
                            ) : (
                              <div className={styles.noImgBox}>📷</div>
                            )}
                          </div>
                          <div>
                            <p className={styles.catName}>{cat.name}</p>
                            {cat.description && (
                              <p className={styles.catDesc}>
                                {cat.description.slice(0, 60)}{cat.description.length > 60 ? "…" : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td><code className={styles.keyTag}>{cat.key}</code></td>
                      <td>
                        <div className={styles.productsCell}>
                          <div>
                            <span className={styles.productCount}>{cat.productCount ?? 0}</span>
                            <span className={styles.productLabel}> Products</span>
                          </div>
                          <button className={styles.viewProductsBtn} onClick={() => viewProducts(cat)}>
                            View Products
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${cat.isActive ? styles.active : styles.inactive}`}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className={styles.sortCell}>{cat.sortOrder}</td>
                      <td className={styles.dateCell}>
                        <span className={styles.dateDate}>{date}</span>
                        <span className={styles.dateTime}>{time}</span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.iconBtnEdit}   title="Edit"   onClick={() => openEdit(cat)}>✎</button>
                          <button className={styles.iconBtnView}   title="View"   onClick={() => viewProducts(cat)}>👁</button>
                          <button className={styles.iconBtnDelete} title="Delete" onClick={() => setDeleteTarget(cat)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} categories
            </span>
            <div className={styles.paginationControls}>
              <button
                className={styles.pageNavBtn}
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={`${styles.pageNumBtn} ${num === currentPage ? styles.pageNumActive : ""}`}
                  onClick={() => setPage(num)}
                >{num}</button>
              ))}
              <button
                className={styles.pageNavBtn}
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >›</button>
            </div>
          </div>
        </>
      )}

      {/* ── Modals ── */}
      <CategoryFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        uploading={uploading}
        submitting={submitting}
        initialData={editTarget}
      />
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        submitting={submitting}
        categoryName={deleteTarget?.name ?? ""}
      />
    </div>
  );
};

export default AllCategoriesPage;