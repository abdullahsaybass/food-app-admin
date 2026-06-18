// features/category/pages/AddCategoryPage.jsx
//
// Full-page "Add/Edit Category" screen (not a modal).
// Add mode:  /categories/add
// Edit mode: /categories/:id/edit
// Layout: breadcrumb + title -> two-column grid (form | live preview) -> fixed bottom action bar.

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCategory from "../hooks/useCategory";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { resolveImageUrl } from "../../../core/config/env";
import styles from "./AddCategoryPage.module.css";

/* ── Helpers ── */
const toKey = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
};

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { submitting, uploading, uploadImage, addCategory, editCategory, getCategoryById, removeCategory } = useCategory();
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  /* ── Form state ── */
  const [name, setName]               = useState("");
  const [key, setKey]                 = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder]     = useState(1);
  const [isActive, setIsActive]       = useState(true);
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerFile, setBannerFile]     = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [keyManuallySet, setKeyManuallySet] = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const [bannerDragOver, setBannerDragOver] = useState(false);
  const [errors, setErrors]           = useState({});

  /* ── Edit-mode-only state ── */
  const [loadingCategory, setLoadingCategory] = useState(isEdit);
  const [existingImage, setExistingImage]   = useState(null);
  const [existingBanner, setExistingBanner] = useState(null);
  const [meta, setMeta] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Load existing category when editing ── */
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoadingCategory(true);
      try {
        const cat = await getCategoryById(id);
        if (cancelled || !cat) return;
        setName(cat.name ?? "");
        setKey(cat.key ?? "");
        setDescription(cat.description ?? "");
        setSortOrder(cat.sortOrder ?? 1);
        setIsActive(cat.isActive ?? true);
        setExistingImage(cat.image ?? null);
        setImagePreview(resolveImageUrl(cat.image?.url) ?? null);
        setExistingBanner(cat.banner ?? null);
        setBannerPreview(resolveImageUrl(cat.banner?.url) ?? null);
        setKeyManuallySet(true);
        setProductCount(cat.productCount ?? cat.productsCount ?? cat.totalProducts ?? 0);
        setMeta({
          createdBy: cat.createdBy ?? cat.createdByName ?? "Admin",
          updatedBy: cat.updatedBy ?? cat.updatedByName ?? "Admin",
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        });
      } catch (err) {
        setErrors((e) => ({ ...e, submit: err.message }));
      } finally {
        if (!cancelled) setLoadingCategory(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isEdit, id, getCategoryById]);

  /* ── Auto-generate key from name ── */
  useEffect(() => {
    if (!keyManuallySet && name) {
      setKey(toKey(name));
    }
  }, [name, keyManuallySet]);

  /* ── Cleanup blob preview URLs ── */
  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  useEffect(() => {
    return () => { if (bannerPreview) URL.revokeObjectURL(bannerPreview); };
  }, [bannerPreview]);

  /* ── Image pick ── */
  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: "Image must be under 2 MB." }));
      return;
    }
    setErrors((e) => ({ ...e, image: undefined }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileInput = (e) => handleImageFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files[0]); };
  const removeImage = () => {
    setImageFile(null); setImagePreview(null); setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Banner pick ── */
  const handleBannerFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 4 * 1024 * 1024) {
      setErrors((e) => ({ ...e, banner: "Banner must be under 4 MB." }));
      return;
    }
    setErrors((e) => ({ ...e, banner: undefined }));
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleBannerInput = (e) => handleBannerFile(e.target.files[0]);
  const handleBannerDrop = (e) => { e.preventDefault(); setBannerDragOver(false); handleBannerFile(e.dataTransfer.files[0]); };
  const removeBanner = () => {
    setBannerFile(null); setBannerPreview(null); setExistingBanner(null);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  /* ── Validate ── */
  const validate = () => {
    const errs = {};
    if (!name.trim() || name.trim().length < 2) errs.name = "Name must be at least 2 characters.";
    if (!key.trim()) errs.key = "Category key is required.";
    if (description.length > 500) errs.description = "Description max 500 characters.";
    if (!sortOrder || sortOrder < 1) errs.sortOrder = "Sort order must be at least 1.";
    return errs;
  };

  const handleCancel = () => navigate("/categories");

  /* ── Submit ── */
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      let image = existingImage ?? null;
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        image = { url: uploaded.url, publicId: uploaded.publicId ?? uploaded.public_id ?? null, altText: name.trim() };
      }

      let banner = existingBanner ?? null;
      if (bannerFile) {
        const uploaded = await uploadImage(bannerFile);
        banner = { url: uploaded.url, publicId: uploaded.publicId ?? uploaded.public_id ?? null, altText: name.trim() };
      }

      const payload = {
        name: name.trim(), key: key.trim(), description: description.trim(),
        sortOrder: Number(sortOrder), isActive, image, banner,
      };

      if (isEdit) {
        await editCategory(id, payload);
        navigate("/categories", { state: { toast: "Category updated successfully." } });
      } else {
        await addCategory(payload);
        navigate("/categories", { state: { toast: "Category created successfully." } });
      }
    } catch (err) {
      setErrors((e) => ({ ...e, submit: err.message }));
    }
  };

  /* ── Delete ── */
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await removeCategory(id);
      navigate("/categories", { state: { toast: "Category deleted successfully." } });
    } catch (err) {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setErrors((e) => ({ ...e, submit: err.message }));
    }
  };

  if (isEdit && loadingCategory) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <span className={styles.spinnerLg} />
          <p>Loading category…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${isEdit ? styles.pageEdit : ""}`}>
      {/* ── Breadcrumb ── */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbLink} onClick={() => navigate("/")}>Dashboard</button>
        <ChevronIcon />
        <button className={styles.breadcrumbLink} onClick={() => navigate("/categories")}>Categories</button>
        <ChevronIcon />
        <span className={styles.breadcrumbCurrent}>{isEdit ? "Edit Category" : "Add Category"}</span>
      </div>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{isEdit ? "Edit Category" : "Add Category"}</h1>
          <p className={styles.pageSub}>
            {isEdit ? "Update category information and manage images" : "Create a new category to organize your products"}
          </p>
        </div>

        {isEdit && (
          <div className={styles.headerActions}>
            <button className={styles.backBtn} onClick={() => navigate("/categories")}>
              <ArrowLeftIcon /> Back to Categories
            </button>
            <button className={styles.deleteCategoryBtn} onClick={() => setShowDeleteConfirm(true)} disabled={submitting || uploading}>
              <TrashIcon /> Delete Category
            </button>
            <button className={styles.saveBtn} onClick={handleSubmit} disabled={submitting || uploading}>
              {submitting || uploading ? <span className={styles.spinner} /> : <CheckIcon />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* ── Two-column layout ── */}
      <div className={styles.grid}>
        {/* LEFT — form */}
        <div className={styles.formCol}>

          {/* 1. Category Banner */}
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>
              Category Banner <span className={styles.optional}>(Optional)</span>
            </h3>
            <p className={styles.cardDesc}>Recommended size: 1200x400px. This banner will be shown on the category page.</p>

            {bannerPreview ? (
              <div className={styles.bannerPreviewWrap}>
                <img src={bannerPreview} alt="Banner preview" className={styles.bannerPreviewImg} />
                <button className={styles.removeBannerImg} onClick={removeBanner} aria-label="Remove banner">✕</button>
                <button type="button" className={styles.changeBannerBtn} onClick={() => bannerInputRef.current?.click()}>
                  <CameraIcon /> Change Banner
                </button>
                <input ref={bannerInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleBannerInput} />
              </div>
            ) : (
              <div
                className={`${styles.dropzone} ${styles.bannerDropzone} ${bannerDragOver ? styles.dragOver : ""}`}
                onClick={() => bannerInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setBannerDragOver(true); }}
                onDragLeave={() => setBannerDragOver(false)}
                onDrop={handleBannerDrop}
              >
                <span className={styles.uploadIcon}><UploadCloudIcon /></span>
                <p className={styles.dropText}>Click to upload banner</p>
                <p className={styles.dropSub}>or drag and drop</p>
                <p className={styles.dropHint}>PNG, JPG or WEBP (Max. 4MB)</p>
                <input ref={bannerInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleBannerInput} />
              </div>
            )}
            {errors.banner && <p className={styles.fieldError}>{errors.banner}</p>}
          </section>

          {/* 2. Category Image + Basic Information */}
          <section className={styles.card}>
            <div className={styles.imageInfoRow}>
              {/* Image upload (left) */}
              <div className={styles.imageCol}>
                <h3 className={styles.cardTitle}>
                  Category Image <span className={styles.optional}>(Optional)</span>
                </h3>
                <p className={styles.cardDesc}>Recommended size: 300x300px. This image will be shown in category list.</p>

                {imagePreview ? (
                  <div className={styles.thumbWrap}>
                    <img src={imagePreview} alt="Preview" className={styles.thumb} />
                    <button className={styles.removeImg} onClick={removeImage} aria-label="Remove image">✕</button>
                    <button type="button" className={styles.changeImgBtn} onClick={() => fileInputRef.current?.click()}>
                      <CameraIcon /> Change Image
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleFileInput} />
                  </div>
                ) : (
                  <div
                    className={`${styles.dropzone} ${styles.squareDropzone} ${dragOver ? styles.dragOver : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <span className={styles.uploadIcon}><UploadCloudIcon /></span>
                    <p className={styles.dropText}>Click to upload image</p>
                    <p className={styles.dropSub}>or drag and drop</p>
                    <p className={styles.dropHint}>PNG, JPG or WEBP (Max. 2MB)</p>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={handleFileInput} />
                  </div>
                )}
                {errors.image && <p className={styles.fieldError}>{errors.image}</p>}
                {uploading && <p className={styles.uploading}>Uploading…</p>}
              </div>

              {/* Basic info (right) */}
              <div className={styles.infoCol}>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Category Name <span className={styles.req}>*</span></label>
                    <input
                      className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dairy & Eggs"
                    />
                    {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Category Key <span className={styles.req}>*</span></label>
                    <input
                      className={`${styles.input} ${errors.key ? styles.inputError : ""}`}
                      value={key}
                      onChange={(e) => { setKey(e.target.value); setKeyManuallySet(true); }}
                      placeholder="e.g. dairy_eggs"
                    />
                    <p className={styles.hint}>Unique key used for system identification</p>
                    {errors.key && <p className={styles.fieldError}>{errors.key}</p>}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a short description…"
                    rows={4}
                    maxLength={500}
                  />
                  <p className={`${styles.charCount} ${description.length > 480 ? styles.charWarn : ""}`}>
                    {description.length}/500
                  </p>
                  {errors.description && <p className={styles.fieldError}>{errors.description}</p>}
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Sort Order <span className={styles.req}>*</span></label>
                    <input
                      type="number"
                      min={1}
                      className={`${styles.input} ${errors.sortOrder ? styles.inputError : ""}`}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    />
                    <p className={styles.hint}>Categories with lower order will appear first</p>
                    {errors.sortOrder && <p className={styles.fieldError}>{errors.sortOrder}</p>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Status</label>
                    <select
                      className={styles.input}
                      value={isActive ? "active" : "inactive"}
                      onChange={(e) => setIsActive(e.target.value === "active")}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <p className={styles.hint}>Inactive categories will not be visible to customers</p>
                  </div>
                </div>
              </div>
            </div>

            {errors.submit && <p className={styles.fieldError}>{errors.submit}</p>}
          </section>
        </div>

        {/* RIGHT — live preview */}
        <aside className={styles.previewCol}>
          {/* Preview header card */}
          <div className={styles.previewCard}>
            <h3 className={styles.previewTitle}>Preview</h3>
            <p className={styles.previewDesc}>This is how the category will appear to customers.</p>

            {/* Banner */}
            <div className={styles.previewBannerBox}>
              {bannerPreview
                ? <img src={bannerPreview} alt="Banner" className={styles.previewBannerImg} />
                : <div className={styles.previewBannerPlaceholder}><ImagePlaceholderIcon /></div>
              }
            </div>

            {/* Category card row: thumbnail + name/description */}
            <div className={styles.previewCategoryCard}>
              <div className={styles.previewThumbWrap}>
                {imagePreview
                  ? <img src={imagePreview} alt={name || "Category"} className={styles.previewThumb} />
                  : <span className={styles.previewThumbPlaceholder}><ImagePlaceholderIcon /></span>
                }
                <button className={styles.previewThumbRemove} aria-label="preview only">✕</button>
              </div>
              <div className={styles.previewCategoryInfo}>
                <p className={styles.previewCategoryName}>{name || "Category Name"}</p>
                <p className={styles.previewCategoryDesc}>
                  {description || "Category description will appear here."}
                </p>
                {isEdit && (
                  <span className={styles.previewCountBadge}>
                    {productCount} Product{productCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Category Information card */}
          <div className={styles.previewCard}>
            <p className={styles.previewInfoTitle}>Category Information</p>
            <div className={styles.previewInfoTable}>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Key</span>
                <span className={styles.infoVal}>{key || "—"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Status</span>
                <span className={`${styles.badge} ${isActive ? styles.badgeActive : styles.badgeInactive}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Sort Order</span>
                <span className={styles.infoVal}>{sortOrder || "—"}</span>
              </div>
              {isEdit && (
                <>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>Created At</span>
                    <span className={styles.infoVal}>{formatDate(meta?.createdAt)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>Updated At</span>
                    <span className={styles.infoVal}>{formatDate(meta?.updatedAt)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Additional Information (Edit mode only) ── */}
      {isEdit && meta && (
        <div className={styles.additionalCard}>
          <h3 className={styles.additionalTitle}>Additional Information</h3>
          <div className={styles.additionalGrid}>
            <div>
              <p className={styles.additionalLabel}>Created By</p>
              <div className={styles.personRow}>
                <span className={styles.avatar}>{(meta.createdBy || "A").charAt(0).toUpperCase()}</span>
                <div>
                  <p className={styles.personName}>{meta.createdBy}</p>
                  <p className={styles.personDate}>{formatDate(meta.createdAt)}</p>
                </div>
              </div>
            </div>
            <div>
              <p className={styles.additionalLabel}>Last Updated By</p>
              <div className={styles.personRow}>
                <span className={styles.avatar}>{(meta.updatedBy || "A").charAt(0).toUpperCase()}</span>
                <div>
                  <p className={styles.personName}>{meta.updatedBy}</p>
                  <p className={styles.personDate}>{formatDate(meta.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed bottom action bar (Add mode only) ── */}
      {!isEdit && (
        <div className={styles.bottomBar}>
          <button className={styles.cancelBtn} onClick={handleCancel} disabled={submitting}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSubmit} disabled={submitting || uploading}>
            {submitting || uploading ? <span className={styles.spinner} /> : <SaveIcon />}
            Save Category
          </button>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {isEdit && (
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteConfirm}
          submitting={deleting || submitting}
          categoryName={name}
        />
      )}
    </div>
  );
};

export default AddCategoryPage;

/* ── Icons ── */
function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function UploadCloudIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}