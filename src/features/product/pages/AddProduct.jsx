// src/features/product/pages/AddProductPage.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateProduct,
  useUpdateProduct,
  useProduct,
  useUploadImages,
  useDeleteImage,
} from '../hooks/useProduct.js';
import { fetchCategories } from '../../catergory/api/category.api.js';
import './AddProduct.css';

const UNITS = [
  'kg', 'g', 'L', 'ml', 'pcs', 'dozen',
  'pkt', 'pack', 'box', 'case', 'bag', 'bottle', 'can', 'tray',
];
const WEIGHT_UNITS = ['g', 'kg', 'ml', 'L'];

const EMPTY_VARIANT = {
  unit: 'pcs', price: '', quantity: '', sku: '',
  bulkPrice: '', minOrderQuantity: 1, stockThreshold: 10, weight: '', weightUnit: 'g',
};

const EMPTY_FORM = {
  name: '', shortDescription: '', description: '',
  category: '',
  brand: '', quality: '', countryOrigin: '',
  storageInstruction: '', usageInstruction: '', tags: '',
  discountPercentage: '', isActive: true,
  featured: false, fresh: false, frozen: false,
  halal: false, bestSeller: false, newArrival: false,
  images: [], variants: [{ ...EMPTY_VARIANT }],
};

export default function AddProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { data: existingProduct } = useProduct(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [expandedVariants, setExpandedVariants] = useState([0]);

  // ✅ Live categories from backend
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const fileInputRef = useRef(null);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadImages = useUploadImages();
  const deleteImage = useDeleteImage();
  const isSaving = createProduct.isPending || updateProduct.isPending;

  // ✅ Fetch categories on mount
  useEffect(() => {
    fetchCategories(false)
      .then((res) => setCategories(res.data?.data ?? []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && existingProduct) {
      const p = existingProduct.data ?? existingProduct;
      setForm({
        name: p.name ?? '',
        shortDescription: p.shortDescription ?? '',
        description: p.description ?? '',
        // ✅ category is now an object from backend — extract _id
        category: p.category?.id ?? p.category?._id ?? p.category ?? '',
        brand: p.brand ?? '',
        quality: p.quality ?? '',
        countryOrigin: p.countryOrigin ?? '',
        storageInstruction: p.storageInstruction ?? '',
        usageInstruction: p.usageInstruction ?? '',
        tags: (p.tags ?? []).join(', '),
        discountPercentage: p.discountPercentage ?? '',
        isActive: p.isActive ?? true,
        featured: p.featured ?? false,
        fresh: p.fresh ?? false,
        frozen: p.frozen ?? false,
        halal: p.halal ?? false,
        bestSeller: p.bestSeller ?? false,
        newArrival: p.newArrival ?? false,
        images: p.images ?? [],
        variants: p.variants?.length
          ? p.variants.map((v) => ({
              unit: v.unit ?? 'pcs', price: v.price ?? '',
              quantity: v.quantity ?? '', sku: v.sku ?? '',
              bulkPrice: v.bulkPrice ?? '',
              minOrderQuantity: v.minOrderQuantity ?? 1,
              stockThreshold: v.stockThreshold ?? 10,
              weight: v.weight ?? '', weightUnit: v.weightUnit ?? 'g',
            }))
          : [{ ...EMPTY_VARIANT }],
      });
      if (p.images?.length) {
        setPreviews(p.images.map((img) => ({
          previewUrl: img.url,
          uploaded: { url: img.url, publicId: img.publicId },
          error: null, isExisting: true,
        })));
      }
      setExpandedVariants([0]);
    }
  }, [isEditMode, existingProduct]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (!p.isExisting && p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      });
    };
  }, []);

  /* ── Image handling ── */
  const handleFiles = async (files) => {
    const valid = Array.from(files).filter(
      (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    if (!valid.length) return;
    const newPreviews = valid.map((file) => ({
      previewUrl: URL.createObjectURL(file),
      uploaded: null, error: null, isExisting: false,
    }));
    const startIdx = previews.length;
    setPreviews((prev) => [...prev, ...newPreviews]);
    setUploading(true);
    try {
      const uploaded = await uploadImages.mutateAsync(valid);
      setPreviews((prev) => {
        const updated = [...prev];
        uploaded.forEach((img, i) => {
          updated[startIdx + i] = { ...updated[startIdx + i], uploaded: img };
        });
        return updated;
      });
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    } catch {
      setPreviews((prev) => {
        const updated = [...prev];
        newPreviews.forEach((_, i) => {
          updated[startIdx + i] = { ...updated[startIdx + i], error: 'Upload failed' };
        });
        return updated;
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (idx) => {
    const p = previews[idx];
    if (p.uploaded?.publicId && !p.isExisting) {
      try { await deleteImage.mutateAsync(p.uploaded.publicId); } catch { /* ignore */ }
    }
    if (!p.isExisting) URL.revokeObjectURL(p.previewUrl);
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  /* ── Variant handling ── */
  const addVariant = () => {
    const newIdx = form.variants.length;
    setForm((prev) => ({ ...prev, variants: [...prev.variants, { ...EMPTY_VARIANT }] }));
    setExpandedVariants((prev) => [...prev, newIdx]);
  };

  const removeVariant = (idx) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
    setExpandedVariants((prev) =>
      prev.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i))
    );
  };

  const toggleVariant = (idx) => {
    setExpandedVariants((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const setVariantField = (idx, field, value) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[idx] = { ...variants[idx], [field]: value };
      return { ...prev, variants };
    });
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.category) e.category = 'Category is required';
    form.variants.forEach((v, i) => {
      if (!v.price || Number(v.price) <= 0) e[`v${i}_price`] = 'Required';
      if (v.quantity === '' || Number(v.quantity) < 0) e[`v${i}_quantity`] = 'Required';
      if (!v.unit) e[`v${i}_unit`] = 'Required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ── */
  const buildPayload = (isDraft) => ({
    name: form.name,
    shortDescription: form.shortDescription,
    description: form.description,
    category: form.category, // ✅ already a Category _id string
    brand: form.brand,
    quality: form.quality,
    countryOrigin: form.countryOrigin,
    storageInstruction: form.storageInstruction,
    usageInstruction: form.usageInstruction,
    tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    discountPercentage: Number(form.discountPercentage) || 0,
    isActive: isDraft ? false : form.isActive,
    featured: form.featured,
    fresh: form.fresh,
    frozen: form.frozen,
    halal: form.halal,
    bestSeller: form.bestSeller,
    newArrival: form.newArrival,
    images: form.images,
    variants: form.variants.map((v) => ({
      unit: v.unit,
      price: Number(v.price) || 0,
      quantity: Number(v.quantity) || 0,
      ...(v.sku?.trim() ? { sku: v.sku.trim() } : {}),
      bulkPrice: Number(v.bulkPrice) || 0,
      minOrderQuantity: Number(v.minOrderQuantity) || 1,
      stockThreshold: Number(v.stockThreshold) || 10,
      weight: Number(v.weight) || 0,
      weightUnit: v.weightUnit,
    })),
  });

  const handleSaveDraft = async () => {
    try {
      const payload = buildPayload(true);
      if (isEditMode) {
        await updateProduct.mutateAsync({ id, payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      navigate('/products');
    } catch { /* global handler */ }
  };

  const handlePublish = async () => {
    if (!validate() || uploading) return;
    try {
      const payload = buildPayload(false);
      if (isEditMode) {
        await updateProduct.mutateAsync({ id, payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      navigate('/products');
    } catch { /* global handler */ }
  };

  const FLAGS = [
    { key: 'featured',   label: 'Featured' },
    { key: 'fresh',      label: 'Fresh' },
    { key: 'frozen',     label: 'Frozen' },
    { key: 'halal',      label: 'Halal' },
    { key: 'bestSeller', label: 'Best Seller' },
    { key: 'newArrival', label: 'New Arrival' },
  ];

  return (
    <div className="ap-wrap">

      {/* ── Top bar ── */}
      <div className="ap-topbar">
        <div className="ap-topbar-left">
          <button className="ap-breadcrumb-btn" onClick={() => navigate('/products')}>
            Products
          </button>
          <ChevronIcon />
          <span className="ap-breadcrumb-current">
            {isEditMode ? 'Edit Product' : 'Add Product'}
          </span>
        </div>
        <div className="ap-topbar-actions">
          <button className="ap-btn-draft" onClick={handleSaveDraft} disabled={isSaving || uploading}>
            <DraftIcon /> Save Draft
          </button>
          <button className="ap-btn-publish" onClick={handlePublish} disabled={isSaving || uploading}>
            <PublishIcon /> {isSaving ? 'Saving...' : 'Publish Product'}
          </button>
        </div>
      </div>

      {/* ── Page title ── */}
      <div className="ap-page-header">
        <h1 className="ap-title">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
        <p className="ap-subtitle">
          {isEditMode ? 'Update product details below' : 'Add a new product to your inventory'}
        </p>
      </div>

      {/* ── Grid ── */}
      <div className="ap-grid">

        {/* ── LEFT COLUMN ── */}
        <div className="ap-col-left">

          {/* 1. Product Images */}
          <Section number="1" title="Product Images">
            <div
              className={'ap-dropzone' + (dragOver ? ' ap-dropzone--over' : '')}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => previews.length === 0 && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef} type="file"
                accept="image/jpeg,image/png,image/webp" multiple
                style={{ display: 'none' }}
                onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
              />
              <UploadCloudIcon />
              <p className="ap-dropzone-text">
                Drag &amp; drop images here<br /><span>or click to upload</span>
              </p>
              <p className="ap-dropzone-hint">JPG, PNG or WEBP (Max. 5MB)</p>
            </div>

            {previews.length > 0 && (
              <div className="ap-img-row">
                {previews.map((preview, idx) => (
                  <div
                    key={idx}
                    className={
                      'ap-img-tile' +
                      (preview.error ? ' ap-img-tile--error' : '') +
                      (!preview.uploaded && !preview.error ? ' ap-img-tile--loading' : '')
                    }
                  >
                    <img src={preview.previewUrl} alt="" />
                    {!preview.uploaded && !preview.error && (
                      <div className="ap-img-overlay"><SpinnerIcon /></div>
                    )}
                    <button className="ap-img-remove" onClick={() => handleRemoveImage(idx)}>×</button>
                  </div>
                ))}
                {previews.length < 8 && (
                  <button className="ap-img-tile ap-img-tile--add" onClick={() => fileInputRef.current?.click()}>
                    <span className="ap-img-add-plus">+</span>
                    <span>Add More</span>
                  </button>
                )}
              </div>
            )}
            {uploading && <p className="ap-hint-loading">Uploading to cloud...</p>}
          </Section>

          {/* 2. Basic Information */}
          <Section number="2" title="Basic Information">
            <Field label="Product Name" required error={errors.name}>
              <input
                className={'ap-input' + (errors.name ? ' ap-input--err' : '')}
                placeholder="e.g. Farm Fresh Milk" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </Field>
            <Field label="Short Description">
              <input
                className="ap-input" placeholder="Brief product summary"
                value={form.shortDescription}
                onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="ap-input ap-textarea" placeholder="Full product description..."
                rows={4} value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
              <span className="ap-char-hint">0/500</span>
            </Field>
          </Section>

        </div>

        {/* ── MIDDLE COLUMN ── */}
        <div className="ap-col-mid">

          {/* 5. Variants */}
          <Section number="5" title="Variants" action={
            <button className="ap-add-variant-btn" onClick={addVariant}>
              <span>+</span> Add Variant
            </button>
          }>
            {form.variants.map((variant, idx) => (
              <div key={idx} className="ap-variant">
                <button className="ap-variant-header" onClick={() => toggleVariant(idx)}>
                  <span className="ap-variant-badge">Variant {idx + 1}</span>
                  <ChevronDownIcon open={expandedVariants.includes(idx)} />
                </button>
                {expandedVariants.includes(idx) && (
                  <div className="ap-variant-body">
                    <div className="ap-row-5">
                      <Field label="Unit" required error={errors[`v${idx}_unit`]}>
                        <select className="ap-input ap-select" value={variant.unit}
                          onChange={(e) => setVariantField(idx, 'unit', e.target.value)}>
                          {UNITS.map((u) => <option key={u}>{u}</option>)}
                        </select>
                      </Field>
                      <Field label="Price (MVR)" required error={errors[`v${idx}_price`]}>
                        <input
                          className={'ap-input' + (errors[`v${idx}_price`] ? ' ap-input--err' : '')}
                          type="number" min="0" step="0.01" placeholder="0.00"
                          value={variant.price}
                          onChange={(e) => setVariantField(idx, 'price', e.target.value)}
                        />
                      </Field>
                      <Field label="Quantity" required error={errors[`v${idx}_quantity`]}>
                        <input
                          className={'ap-input' + (errors[`v${idx}_quantity`] ? ' ap-input--err' : '')}
                          type="number" min="0" placeholder="0"
                          value={variant.quantity}
                          onChange={(e) => setVariantField(idx, 'quantity', e.target.value)}
                        />
                      </Field>
                      <Field label="Weight">
                        <input className="ap-input" type="number" min="0" placeholder="0"
                          value={variant.weight}
                          onChange={(e) => setVariantField(idx, 'weight', e.target.value)} />
                      </Field>
                      <Field label="Weight Unit">
                        <select className="ap-input ap-select" value={variant.weightUnit}
                          onChange={(e) => setVariantField(idx, 'weightUnit', e.target.value)}>
                          {WEIGHT_UNITS.map((u) => <option key={u}>{u}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className="ap-row-3">
                      <Field label="SKU">
                        <input className="ap-input" placeholder="Auto-generated if empty"
                          value={variant.sku}
                          onChange={(e) => setVariantField(idx, 'sku', e.target.value)} />
                      </Field>
                      <Field label="Bulk Price (MVR)">
                        <input className="ap-input" type="number" min="0" step="0.01" placeholder="0.00"
                          value={variant.bulkPrice}
                          onChange={(e) => setVariantField(idx, 'bulkPrice', e.target.value)} />
                      </Field>
                      <Field label="Min Order Qty">
                        <input className="ap-input" type="number" min="1" placeholder="1"
                          value={variant.minOrderQuantity}
                          onChange={(e) => setVariantField(idx, 'minOrderQuantity', e.target.value)} />
                      </Field>
                    </div>
                    <div className="ap-row-2">
                      <Field label="Stock Threshold">
                        <input className="ap-input" type="number" min="0" placeholder="10"
                          value={variant.stockThreshold}
                          onChange={(e) => setVariantField(idx, 'stockThreshold', e.target.value)} />
                      </Field>
                    </div>
                    {form.variants.length > 1 && (
                      <button className="ap-remove-variant-btn" onClick={() => removeVariant(idx)}>
                        <TrashIcon /> Remove Variant
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </Section>

          {/* 6. Product Flags */}
          <Section number="6" title="Product Flags">
            <div className="ap-flags">
              {FLAGS.map(({ key, label }) => (
                <label key={key} className={'ap-flag' + (form[key] ? ' ap-flag--on' : '')}>
                  <input type="checkbox" checked={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))} />
                  {form[key] && <CheckIcon />}
                  {label}
                </label>
              ))}
            </div>
          </Section>

          {/* 7. Discount & Tags */}
          <Section number="7" title="Discount &amp; Tags">
            <div className="ap-row-2">
              <Field label="Discount Percentage (%)">
                <input className="ap-input" type="number" min="0" max="100" placeholder="0"
                  value={form.discountPercentage}
                  onChange={(e) => setForm((p) => ({ ...p, discountPercentage: e.target.value }))} />
              </Field>
              <Field label="Tags (comma separated)">
                <input className="ap-input" placeholder="milk, dairy, fresh, healthy"
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
              </Field>
            </div>
          </Section>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="ap-col-right">

          {/* 3. Category ✅ from API */}
          <Section number="3" title="Category">
            <Field label="Category" required error={errors.category}>
              <select
                className={'ap-input ap-select' + (errors.category ? ' ap-input--err' : '')}
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select category'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id ?? cat._id} value={cat.id ?? cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          {/* 4. Brand & Product Info */}
          <Section number="4" title="Brand &amp; Product Info">
            <Field label="Brand">
              <input className="ap-input" placeholder="e.g. Farm Fresh" value={form.brand}
                onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
            </Field>
            <Field label="Quality">
              <input className="ap-input" placeholder="e.g. Premium" value={form.quality}
                onChange={(e) => setForm((p) => ({ ...p, quality: e.target.value }))} />
            </Field>
            <Field label="Country Origin">
              <input className="ap-input" placeholder="e.g. Maldives" value={form.countryOrigin}
                onChange={(e) => setForm((p) => ({ ...p, countryOrigin: e.target.value }))} />
            </Field>
            <Field label="Storage Instruction">
              <input className="ap-input" placeholder="e.g. Keep refrigerated below 4°C"
                value={form.storageInstruction}
                onChange={(e) => setForm((p) => ({ ...p, storageInstruction: e.target.value }))} />
            </Field>
            <Field label="Usage Instruction">
              <input className="ap-input" placeholder="e.g. Shake well before use"
                value={form.usageInstruction}
                onChange={(e) => setForm((p) => ({ ...p, usageInstruction: e.target.value }))} />
            </Field>
          </Section>

          {/* 8. Product Status */}
          <Section number="8" title="Product Status">
            <div className="ap-status-row">
              <span className="ap-status-label">Active Product</span>
              <button
                className={'ap-toggle' + (form.isActive ? ' ap-toggle--on' : '')}
                onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                type="button"
              >
                <span className="ap-toggle-thumb" />
              </button>
            </div>
          </Section>

          {/* 9. Additional Info (edit mode only) */}
          {isEditMode && existingProduct && (
            <Section number="9" title="Additional Info">
              <div className="ap-info-grid">
                {[
                  { label: 'Rating', value: existingProduct?.data?.rating ?? existingProduct?.rating ?? 0 },
                  { label: 'Total Reviews', value: existingProduct?.data?.reviewCount ?? existingProduct?.reviewCount ?? 0 },
                  { label: 'Total Sold', value: existingProduct?.data?.totalSold ?? existingProduct?.totalSold ?? 0 },
                  { label: 'Total Views', value: existingProduct?.data?.totalViews ?? existingProduct?.totalViews ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="ap-info-item">
                    <span className="ap-info-label">{label}</span>
                    <span className="ap-info-value">{value}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="ap-bottom-bar">
        <button className="ap-bottom-draft" onClick={handleSaveDraft} disabled={isSaving || uploading}>
          <DraftIcon /> Save Draft
        </button>
        <button className="ap-bottom-publish" onClick={handlePublish} disabled={isSaving || uploading}>
          <PublishIcon /> {isSaving ? 'Saving...' : 'Publish Product'}
        </button>
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function Section({ number, title, children, action }) {
  return (
    <div className="ap-section">
      <div className="ap-section-header">
        <h3 className="ap-section-title">
          <span className="ap-section-num">{number}.</span> {title}
        </h3>
        {action}
      </div>
      <div className="ap-section-body">{children}</div>
    </div>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div className="ap-field">
      <label className="ap-label">
        {label}{required && <span className="ap-required"> *</span>}
      </label>
      {children}
      {error && <p className="ap-field-err">{error}</p>}
    </div>
  );
}

/* ── Icons ── */
function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function ChevronDownIcon({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function DraftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
function PublishIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function UploadCloudIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
      style={{ animation: 'ap-spin 0.8s linear infinite' }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}