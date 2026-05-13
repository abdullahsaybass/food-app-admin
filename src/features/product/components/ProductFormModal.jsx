// src/features/product/components/ProductFormModal.jsx

import { useState, useEffect, useRef } from 'react';
import { useCreateProduct, useUpdateProduct, useUploadImages, useDeleteImage } from '../hooks/useProduct.js';
import './ProductFormModal.css';

const EMPTY_FORM = {
  name: '',
  description: '',
  sku: '',
  price: 0,
  quantity: 0,
  unit: 'pcs',
  category: '',
  images: [],
  stockThreshold: 10,
};

export function ProductFormModal({ mode, product, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState([]);

  const fileInputRef = useRef(null);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadImages  = useUploadImages();
  const deleteImage   = useDeleteImage();
  const isLoading = createProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (mode === 'edit' && product) {
      setForm({
        name:           product.name,
        description:    product.description ?? '',
        sku:            product.sku,
        price:          product.price,
        quantity:       product.quantity,
        unit:           product.unit,
        category:       product.category,
        images:         product.images ?? [],
        stockThreshold: product.stockThreshold,
      });
      if (product.images?.length) {
        setPreviews(
          product.images.map((img) => ({
            previewUrl: img.url,
            uploaded:   { url: img.url, publicId: img.publicId },
            error:      null,
            isExisting: true,
          }))
        );
      }
    }
  }, [mode, product]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (!p.isExisting && p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      });
    };
  }, []);

  const handleFiles = async (files) => {
    const valid = Array.from(files).filter(
      (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    if (!valid.length) return;

    const newPreviews = valid.map((file) => ({
      previewUrl: URL.createObjectURL(file),
      uploaded:   null,
      error:      null,
      isExisting: false,
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

  const handleDragOver  = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop      = (e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Name is required';
    if (!form.sku.trim())      e.sku      = 'SKU is required';
    if (form.price <= 0)       e.price    = 'Price must be greater than 0';
    if (form.quantity < 0)     e.quantity = 'Quantity cannot be negative';
    if (!form.category.trim()) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate() || uploading) return;
    try {
      if (mode === 'create') {
        await createProduct.mutateAsync(form);
      } else {
        await updateProduct.mutateAsync({ id: product.id, payload: form });
      }
      onClose();
    } catch { /* global handler */ }
  };

  return (
    <div className="pfm-overlay" onClick={onClose}>
      <div className="pfm-modal" onClick={(e) => e.stopPropagation()}>

        <div className="pfm-header">
          <h2 className="pfm-title">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button className="pfm-close" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="pfm-body">

          {/* Image Upload */}
          <div className="pfm-field">
            <label className="pfm-label">Product Images</label>
            <div
              className={'pfm-dropzone' + (dragOver ? ' pfm-dropzone--over' : '')}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => previews.length === 0 && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
              />
              {previews.length === 0 ? (
                <div className="pfm-dropzone-empty">
                  <UploadIcon />
                  <p className="pfm-dropzone-text"><strong>Click to upload</strong> or drag and drop</p>
                  <p className="pfm-dropzone-hint">PNG, JPG, WEBP · max 5MB each · up to 5 images</p>
                </div>
              ) : (
                <div className="pfm-images-grid" onClick={(e) => e.stopPropagation()}>
                  {previews.map((preview, idx) => (
                    <div
                      key={idx}
                      className={
                        'pfm-img-tile' +
                        (preview.error ? ' pfm-img-tile--error' : '') +
                        (!preview.uploaded && !preview.error ? ' pfm-img-tile--loading' : '')
                      }
                    >
                      <img src={preview.previewUrl} alt="" className="pfm-img-preview" />
                      {!preview.uploaded && !preview.error && (
                        <div className="pfm-img-overlay"><SpinnerIcon /></div>
                      )}
                      {preview.error && (
                        <div className="pfm-img-overlay pfm-img-overlay--err">
                          <span className="pfm-img-err-icon">!</span>
                        </div>
                      )}
                      <button className="pfm-img-remove" onClick={() => handleRemoveImage(idx)}>
                        <CloseIcon />
                      </button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <button
                      className="pfm-img-tile pfm-img-tile--add"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <PlusIcon /><span>Add</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            {uploading && (
              <p className="pfm-upload-hint pfm-upload-hint--loading">Uploading to cloud...</p>
            )}
            {!uploading && previews.some((p) => p.error) && (
              <p className="pfm-upload-hint pfm-upload-hint--error">Some images failed. Remove and try again.</p>
            )}
          </div>

          {/* Name + SKU */}
          <div className="pfm-row">
            <Field label="Product Name" error={errors.name} required>
              <input
                className={'pfm-input' + (errors.name ? ' pfm-input--error' : '')}
                placeholder="e.g. Fresh Orange"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </Field>
            <Field label="SKU" error={errors.sku} required>
              <input
                className={'pfm-input' + (errors.sku ? ' pfm-input--error' : '')}
                placeholder="Auto-generated if empty"
                value={form.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
              />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <textarea
              className="pfm-input pfm-textarea"
              placeholder="Product description..."
              rows={3}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Field>

          {/* Price + Quantity + Unit */}
          <div className="pfm-row pfm-row--3">
            <Field label="Price ($)" error={errors.price} required>
              <input
                className={'pfm-input' + (errors.price ? ' pfm-input--error' : '')}
                type="number" min="0" step="0.01" placeholder="0.00"
                value={form.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              />
            </Field>
            <Field label="Quantity" error={errors.quantity} required>
              <input
                className={'pfm-input' + (errors.quantity ? ' pfm-input--error' : '')}
                type="number" min="0" placeholder="0"
                value={form.quantity || ''}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
              />
            </Field>
            <Field label="Unit" required>
              <select
                className="pfm-input pfm-select"
                value={form.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
              >
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="pack">pack</option>
                <option value="dozen">dozen</option>
                <option value="box">box</option>
              </select>
            </Field>
          </div>

          {/* Category + Stock Threshold */}
          <div className="pfm-row">
           <Field label="Category" error={errors.category} required>
              <select
                className="pfm-input pfm-select"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="">Select Category</option>

                <option value="liter">liter</option>
                <option value="frozen">frozen</option>
                <option value="nuts">nuts</option>
                <option value="dairy">dairy</option>
                <option value="beverages">beverages</option>
                <option value="snacks">snacks</option>
                <option value="grains">grains</option>
                <option value="other">other</option>
              </select>
            </Field>
            <Field label="Low Stock Threshold">
              <input
                className="pfm-input"
                type="number" min="0" placeholder="10"
                value={form.stockThreshold || ''}
                onChange={(e) => handleChange('stockThreshold', parseInt(e.target.value) || 0)}
              />
            </Field>
          </div>

        </div>

        <div className="pfm-footer">
          <button className="pfm-btn pfm-btn--cancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className="pfm-btn pfm-btn--submit"
            onClick={handleSubmit}
            disabled={isLoading || uploading}
          >
            {uploading
              ? 'Uploading...'
              : isLoading
                ? (mode === 'create' ? 'Creating...' : 'Saving...')
                : (mode === 'create' ? 'Create Product' : 'Save Changes')
            }
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div className="pfm-field">
      <label className="pfm-label">
        {label}{required && <span className="pfm-required"> *</span>}
      </label>
      {children}
      {error && <p className="pfm-error">{error}</p>}
    </div>
  );
}

function CloseIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function UploadIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function PlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
      style={{ animation: 'pfm-spin 0.8s linear infinite' }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}