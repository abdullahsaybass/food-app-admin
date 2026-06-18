// features/category/components/CategoryFormModal.jsx
import { useState, useEffect, useRef } from "react";
import { resolveImageUrl } from "../../../core/config/env";
import styles from "./CategoryFormModal.module.css";

/* ── Helpers ── */
const toKey = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const CategoryFormModal = ({ isOpen, onClose, onSubmit, uploading, submitting, initialData = null }) => {
  const isEdit = Boolean(initialData);
  const fileInputRef = useRef(null);

  /* ── Form state ── */
  const [name, setName]               = useState("");
  const [key, setKey]                 = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder]     = useState(1);
  const [isActive, setIsActive]       = useState(true);
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [keyManuallySet, setKeyManuallySet] = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const [errors, setErrors]           = useState({});

  /* ── Populate on edit ── */
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && initialData) {
      setName(initialData.name ?? "");
      setKey(initialData.key ?? "");
      setDescription(initialData.description ?? "");
      setSortOrder(initialData.sortOrder ?? 1);
      setIsActive(initialData.isActive ?? true);
      setExistingImage(initialData.image ?? null);
      setImagePreview(resolveImageUrl(initialData.image?.url) ?? null);
      setImageFile(null);
      setKeyManuallySet(true);
    } else {
      setName(""); setKey(""); setDescription("");
      setSortOrder(1); setIsActive(true);
      setImageFile(null); setImagePreview(null); setExistingImage(null);
      setKeyManuallySet(false);
    }
    setErrors({});
  }, [isOpen, isEdit, initialData]);

  /* ── Auto-generate key from name ── */
  useEffect(() => {
    if (!keyManuallySet && name) {
      setKey(toKey(name));
    }
  }, [name, keyManuallySet]);

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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFile(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  /* ── Submit ── */
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    await onSubmit({
      name: name.trim(),
      key: key.trim(),
      description: description.trim(),
      sortOrder: Number(sortOrder),
      isActive,
      imageFile,         // new file to upload (if any)
      existingImage,     // keep existing if no new file
      removeImage: !imagePreview, // signal to remove image entirely
    });
  };

  if (!isOpen) return null;

  const previewImage = imagePreview;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{isEdit ? "Edit Category" : "Add Category"}</h2>
            <p className={styles.subtitle}>
              {isEdit ? "Update category details" : "Create a new category to organize your products"}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Body: left form + right preview ── */}
        <div className={styles.body}>
          {/* LEFT — form */}
          <div className={styles.formCol}>
            {/* 1. Image */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}><span className={styles.sectionNum}>1.</span> Category Image</h3>
              <p className={styles.sectionDesc}>This image will be shown in category list and home page.</p>
              <div className={styles.imageRow}>
                {/* Drop zone */}
                <div
                  className={`${styles.dropzone} ${dragOver ? styles.dragOver : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <span className={styles.uploadIcon}>☁</span>
                  <p className={styles.dropText}>Click to upload image</p>
                  <p className={styles.dropSub}>or drag and drop</p>
                  <p className={styles.dropHint}>PNG, JPG or WEBP (Max. 2MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: "none" }}
                    onChange={handleFileInput}
                  />
                </div>

                {/* Preview thumb */}
                {previewImage && (
                  <div className={styles.thumbWrap}>
                    <img src={previewImage} alt="Preview" className={styles.thumb} />
                    <button className={styles.removeImg} onClick={removeImage} aria-label="Remove image">✕</button>
                  </div>
                )}
              </div>
              {errors.image && <p className={styles.fieldError}>{errors.image}</p>}
              {uploading && <p className={styles.uploading}>Uploading image…</p>}
            </section>

            {/* 2. Basic Info */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}><span className={styles.sectionNum}>2.</span> Basic Information</h3>
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
                  <p className={styles.hint}>Unique key used for system (auto generated from name)</p>
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
            </section>

            {/* 3 & 4 — Display Order + Status side by side */}
            <div className={styles.row2}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}><span className={styles.sectionNum}>3.</span> Display Order</h3>
                <div className={styles.field}>
                  <label className={styles.label}>Sort Order <span className={styles.req}>*</span></label>
                  <input
                    type="number"
                    min={1}
                    className={`${styles.input} ${errors.sortOrder ? styles.inputError : ""}`}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                  <p className={styles.hint}>Categories with lower sort order will appear first.</p>
                  {errors.sortOrder && <p className={styles.fieldError}>{errors.sortOrder}</p>}
                </div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}><span className={styles.sectionNum}>4.</span> Status</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <p className={styles.toggleLabel}>Active Category</p>
                    <p className={styles.toggleDesc}>This category will be visible to customers</p>
                  </div>
                  <button
                    type="button"
                    className={`${styles.toggle} ${isActive ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => setIsActive((v) => !v)}
                    aria-pressed={isActive}
                  >
                    <span className={styles.toggleThumb} />
                  </button>
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT — live preview */}
          <aside className={styles.previewCol}>
            <h3 className={styles.previewTitle}>Category Preview</h3>
            <p className={styles.previewDesc}>This is how it will look on your store.</p>

            <div className={styles.previewCard}>
              <p className={styles.previewLabel}>Category Icon Preview</p>
              <div className={styles.previewImgBox}>
                {previewImage
                  ? <img src={previewImage} alt={name || "Category"} className={styles.previewImg} />
                  : <span className={styles.previewImgPlaceholder}>📷</span>
                }
              </div>
              <p className={styles.previewName}>{name || "Category Name"}</p>
            </div>

            <div className={styles.previewInfo}>
              <p className={styles.previewInfoTitle}>Category Info Preview</p>
              <div className={styles.previewInfoTable}>
                <div className={styles.infoRow}>
                  <span className={styles.infoKey}>Key</span>
                  <span className={styles.infoVal}>{key || "—"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoKey}>Sort Order</span>
                  <span className={styles.infoVal}>{sortOrder || "—"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoKey}>Status</span>
                  <span className={`${styles.badge} ${isActive ? styles.badgeActive : styles.badgeInactive}`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoKey}>Home Page</span>
                  <span className={`${styles.badge} ${styles.badgeVisible}`}>Visible</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSubmit} disabled={submitting || uploading}>
            {submitting || uploading
              ? <span className={styles.spinner} />
              : <span className={styles.saveIcon}>💾</span>
            }
            {isEdit ? "Update Category" : "Save Category"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;