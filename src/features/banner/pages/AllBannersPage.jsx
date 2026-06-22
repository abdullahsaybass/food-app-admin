// features/banner/pages/AllBannersPage.jsx
import { useState } from "react";
import useBanner from "../hooks/useBanner";
import BannerFormModal from "../components/BannerFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { resolveImageUrl } from "../../../core/config/env";
import styles from "./AllBannersPage.module.css";

const PAGE_SIZE = 8;

const POSITION_LABELS = {
  home_top:     "Home — Top",
  home_middle:  "Home — Middle",
  home_bottom:  "Home — Bottom",
  category_top: "Category — Top",
  product_top:  "Product — Top",
  checkout:     "Checkout",
};

const AllBannersPage = () => {
  const {
    banners,
    loading,
    submitting,
    uploading,
    error,
    uploadImage,
    addBanner,
    editBanner,
    removeBanner,
  } = useBanner();

  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
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
  let filtered = banners.filter((b) => {
    const matchesSearch = b.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && b.isActive) ||
      (statusFilter === "Inactive" && !b.isActive);
    const matchesPosition = positionFilter === "All" || b.position === positionFilter;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  /* ── Sort ── */
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "sortDesc": return (b.sortOrder ?? 0) - (a.sortOrder ?? 0);
      case "titleAsc":  return a.title.localeCompare(b.title);
      case "titleDesc": return b.title.localeCompare(a.title);
      case "newest":    return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":    return new Date(a.createdAt) - new Date(b.createdAt);
      case "sortAsc":
      default:          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    }
  });

  /* ── Pagination ── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /* ── Stats ── */
  const totalBanners    = banners.length;
  const activeBanners    = banners.filter((b) => b.isActive).length;
  const liveBanners      = banners.filter((b) => b.isLive).length;
  const inactiveBanners  = totalBanners - activeBanners;

  const openAdd  = () => { setEditTarget(null); setShowForm(true); };
  const openEdit = (b) => { setEditTarget(b); setShowForm(true); };

  const handleFormSubmit = async ({ imageFile, existingImage, ...fields }) => {
    try {
      let image = existingImage ?? null;
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        image = { url: uploaded.url, publicId: uploaded.publicId ?? uploaded.public_id ?? null, altText: fields.title };
      }
      const payload = { ...fields, image };
      if (editTarget) {
        await editBanner(editTarget._id ?? editTarget.id, payload);
        showToast("Banner updated successfully.");
      } else {
        await addBanner(payload);
        showToast("Banner created successfully.");
      }
      setShowForm(false);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async () => {
    try {
      await removeBanner(deleteTarget._id ?? deleteTarget.id);
      setDeleteTarget(null);
      showToast("Banner deleted.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
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
          <h1 className={styles.pageTitle}>Banners</h1>
          <p className={styles.pageSub}>Manage promotional banners shown across the app.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.addBtn} onClick={openAdd}>
            <span className={styles.addBtnIcon}>+</span> Add Banner
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statIconGreen}`}>🖼️</span>
          <div>
            <p className={styles.statLabel}>Total Banners</p>
            <p className={styles.statValue}>{totalBanners}</p>
            <p className={styles.statHint}>All banners</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statIconBlue}`}>🟢</span>
          <div>
            <p className={styles.statLabel}>Live Now</p>
            <p className={styles.statValue}>{liveBanners}</p>
            <p className={styles.statHint}>Active &amp; within schedule</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statIconPurple}`}>📅</span>
          <div>
            <p className={styles.statLabel}>Active</p>
            <p className={styles.statValue}>{activeBanners}</p>
            <p className={styles.statHint}>Marked active</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statIconOrange}`}>📁</span>
          <div>
            <p className={styles.statLabel}>Inactive</p>
            <p className={styles.statValue}>{inactiveBanners}</p>
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
            placeholder="Search banners..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className={styles.statusWrap}>
          <span className={styles.statusLabel}>Position</span>
          <select
            className={styles.statusSelect}
            value={positionFilter}
            onChange={(e) => { setPositionFilter(e.target.value); setPage(1); }}
          >
            <option value="All">All</option>
            {Object.entries(POSITION_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
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
            <select className={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="sortAsc">Sort Order (Low to High)</option>
              <option value="sortDesc">Sort Order (High to Low)</option>
              <option value="titleAsc">Title (A–Z)</option>
              <option value="titleDesc">Title (Z–A)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

      {/* ── Table ── */}
      {loading ? (
        <div className={styles.loadingWrap}>
          <span className={styles.loadingSpinner} />
          <p>Loading banners…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🖼️</span>
          <p>{search ? "No banners match your search." : "No banners yet. Add your first one!"}</p>
          {!search && <button className={styles.addBtn} onClick={openAdd}>+ Add Banner</button>}
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Banner</th>
                  <th>Position</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Sort Order</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((b, idx) => {
                  const bId    = b._id ?? b.id;
                  const rowNum = (currentPage - 1) * PAGE_SIZE + idx + 1;
                  return (
                    <tr key={bId} className={styles.row}>
                      <td className={styles.rowNum}>{rowNum}</td>
                      <td>
                        <div className={styles.catCell}>
                          <div className={styles.catImgs}>
                            {b.image?.url ? (
                              <img src={resolveImageUrl(b.image.url)} alt={b.title} className={styles.catImgLg} />
                            ) : (
                              <div className={styles.noImgBox}>🖼️</div>
                            )}
                          </div>
                          <div>
                            <p className={styles.catName}>{b.title}</p>
                            {b.subtitle && <p className={styles.catDesc}>{b.subtitle}</p>}
                          </div>
                        </div>
                      </td>
                      <td><code className={styles.keyTag}>{POSITION_LABELS[b.position] ?? b.position}</code></td>
                      <td className={styles.dateCell}>
                        <span className={styles.dateDate}>{formatDate(b.startDate)} → {formatDate(b.endDate)}</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${b.isActive ? styles.active : styles.inactive}`}>
                          {b.isLive ? "Live" : b.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className={styles.sortCell}>{b.sortOrder ?? 0}</td>
                      <td className={styles.dateCell}>
                        <span className={styles.dateDate}>{formatDate(b.createdAt)}</span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.iconBtnEdit}   title="Edit"   onClick={() => openEdit(b)}>✎</button>
                          <button className={styles.iconBtnDelete} title="Delete" onClick={() => setDeleteTarget(b)}>🗑</button>
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
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} banners
            </span>
            <div className={styles.paginationControls}>
              <button className={styles.pageNavBtn} disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  className={`${styles.pageNumBtn} ${num === currentPage ? styles.pageNumActive : ""}`}
                  onClick={() => setPage(num)}
                >{num}</button>
              ))}
              <button className={styles.pageNavBtn} disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</button>
            </div>
          </div>
        </>
      )}

      {/* ── Modals ── */}
      <BannerFormModal
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
        bannerName={deleteTarget?.title ?? ""}
      />
    </div>
  );
};

export default AllBannersPage;
