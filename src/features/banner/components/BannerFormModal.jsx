// features/banner/components/BannerFormModal.jsx
import { useState, useEffect, useRef } from "react";
import { resolveImageUrl } from "../../../core/config/env";
import styles from "./BannerFormModal.module.css";

const POSITIONS = [
  { value: "home_top",     label: "Home — Top" },
  { value: "home_middle",  label: "Home — Middle" },
  { value: "home_bottom",  label: "Home — Bottom" },
  { value: "category_top", label: "Category — Top" },
  { value: "product_top",  label: "Product — Top" },
  { value: "checkout",     label: "Checkout" },
];

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const BannerFormModal = ({ isOpen, onClose, onSubmit, uploading, submitting, initialData = null }) => {
  const isEdit = Boolean(initialData);
  const fileInputRef = useRef(null);

  const [title, setTitle]             = useState("");
  const [subtitle, setSubtitle]       = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl]         = useState("");
  const [linkText, setLinkText]       = useState("");
  const [position, setPosition]       = useState("home_top");
  const [sortOrder, setSortOrder]     = useState(0);
  const [startDate, setStartDate]     = useState("");
  const [endDate, setEndDate]         = useState("");
  const [isActive, setIsActive]       = useState(true);
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const [errors, setErrors]           = useState({});

  /* ── Populate on edit ── */
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && initialData) {
      setTitle(initialData.title ?? "");
      setSubtitle(initialData.subtitle ?? "");
      setDescription(initialData.description ?? "");
      setLinkUrl(initialData.linkUrl ?? "");
      setLinkText(initialData.linkText ?? "");
      setPosition(initialData.position ?? "home_top");
      setSortOrder(initialData.sortOrder ?? 0);
      setStartDate(toDateInput(initialData.startDate));
      setEndDate(toDateInput(initialData.endDate));
      setIsActive(initialData.isActive ?? true);
      setExistingImage(initialData.image ?? null);
      setImagePreview(resolveImageUrl(initialData.image?.url) ?? null);
      setImageFile(null);
    } else {
      setTitle(""); setSubtitle(""); setDescription("");
      setLinkUrl(""); setLinkText(""); setPosition("home_top");
      setSortOrder(0); setStartDate(""); setEndDate(""); setIsActive(true);
      setImageFile(null); setImagePreview(null); setExistingImage(null);
    }
    setErrors({});
  }, [isOpen, isEdit, initialData]);

  /* ── Image pick ── */
  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 3 * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: "Image must be under 3 MB." }));
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
    if (!title.trim() || title.trim().length < 2) errs.title = "Title must be at least 2 characters.";
    if (!position) errs.position = "Position is required.";
    if (!imagePreview) errs.image = "Banner image is required.";
    if (startDate && endDate && endDate < startDate) errs.endDate = "End date must be after start date.";
    if (linkUrl && !/^https?:\/\//i.test(linkUrl)) errs.linkUrl = "Link must start with http:// or https://";
    return errs;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    await onSubmit({
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      linkUrl: linkUrl.trim(),
      linkText: linkText.trim(),
      position,
      sortOrder: Number(sortOrder),
      startDate: startDate || null,
      endDate: endDate || null,
      isActive,
      imageFile,
      existingImage,
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{isEdit ? "Edit Banner" : "Add Banner"}</h2>
            <p className={styles.subtitle}>
              {isEdit ? "Update banner details" : "Create a promotional banner for a page position"}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.body}>
          {/* LEFT — form */}
          <div className={styles.formCol}>
            {/* 1. Image */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}><span className={styles.sectionNum}>1.</span> Banner Image</h3>
              <p className={styles.sectionDesc}>Recommended size depends on position (e.g. wide for home banners).</p>
              <div className={styles.imageRow}>
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
                  <p className={styles.dropHint}>PNG, JPG or WEBP (Max. 3MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: "none" }}
                    onChange={handleFileInput}
                  />
                </div>
                {imagePreview && (
                  <div className={styles.thumbWrap}>
                    <img src={imagePreview} alt="Preview" className={styles.thumb} />
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
                  <label className={styles.label}>Title <span className={styles.req}>*</span></label>
                  <input
                    className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekend Fresh Produce Sale"
                  />
                  {errors.title && <p className={styles.fieldError}>{errors.title}</p>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Subtitle</label>
                  <input
                    className={styles.input}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Up to 30% off"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a short description…"
                  rows={3}
                  maxLength={1000}
                />
                <p className={`${styles.charCount} ${description.length > 950 ? styles.charWarn : ""}`}>
                  {description.length}/1000
                </p>
              </div>
            </section>

            {/* 3. Link */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}><span className={styles.sectionNum}>3.</span> Link (optional)</h3>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Link URL</label>
                  <input
                    className={`${styles.input} ${errors.linkUrl ? styles.inputError : ""}`}
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  {errors.linkUrl && <p className={styles.fieldError}>{errors.linkUrl}</p>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Link Text</label>
                  <input
                    className={styles.input}
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="e.g. Shop Now"
                  />
                </div>
              </div>
            </section>

            {/* 4. Placement */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}><span className={styles.sectionNum}>4.</span> Placement</h3>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Position <span className={styles.req}>*</span></label>
                  <select
                    className={`${styles.input} ${errors.position ? styles.inputError : ""}`}
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  {errors.position && <p className={styles.fieldError}>{errors.position}</p>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    className={styles.input}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                  <p className={styles.hint}>Lower numbers appear first within the same position.</p>
                </div>
              </div>
            </section>

            {/* 5. Schedule + Status */}
            <div className={styles.row2}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}><span className={styles.sectionNum}>5.</span> Schedule</h3>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Start Date</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>End Date</label>
                    <input
                      type="date"
                      className={`${styles.input} ${errors.endDate ? styles.inputError : ""}`}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    {errors.endDate && <p className={styles.fieldError}>{errors.endDate}</p>}
                  </div>
                </div>
                <p className={styles.hint}>Leave blank to run indefinitely (no start/end limit).</p>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}><span className={styles.sectionNum}>6.</span> Status</h3>
                <div className={styles.toggleRow}>
                  <div>
                    <p className={styles.toggleLabel}>Active Banner</p>
                    <p className={styles.toggleDesc}>This banner will be shown if active and within schedule</p>
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
            <h3 className={styles.previewTitle}>Banner Preview</h3>
            <p className={styles.previewDesc}>This is how it will look on your store.</p>

            <div className={styles.previewCard}>
              <p className={styles.previewLabel}>Image Preview</p>
              <div className={styles.previewImgBox}>
                {imagePreview
                  ? <img src={imagePreview} alt={title || "Banner"} className={styles.previewImg} />
                  : <span className={styles.previewImgPlaceholder}>🖼️</span>
                }
              </div>
              <p className={styles.previewName}>{title || "Banner Title"}</p>
            </div>

            <div className={styles.previewInfo}>
              <p className={styles.previewInfoTitle}>Banner Info Preview</p>
              <div className={styles.previewInfoTable}>
                <div className={styles.infoRow}>
                  <span className={styles.infoKey}>Position</span>
                  <span className={styles.infoVal}>{POSITIONS.find((p) => p.value === position)?.label ?? "—"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoKey}>Sort Order</span>
                  <span className={styles.infoVal}>{sortOrder}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoKey}>Schedule</span>
                  <span className={styles.infoVal}>
                    {startDate || endDate ? `${startDate || "…"} → ${endDate || "…"}` : "No limit"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoKey}>Status</span>
                  <span className={`${styles.badge} ${isActive ? styles.badgeActive : styles.badgeInactive}`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
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
            {isEdit ? "Update Banner" : "Save Banner"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerFormModal;
