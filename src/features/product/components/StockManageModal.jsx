// src/features/product/components/StockManageModal.jsx

import { useState } from 'react';
import { useAdjustStock, useSetStock, useUpdateThreshold } from '../hooks/useInventory.js';
import './StockManageModal.css';

const MODES = [
  { key: 'adjust',    label: 'Add / Remove' },
  { key: 'set',       label: 'Set Exact' },
  { key: 'threshold', label: 'Low Stock Alert' },
];

export function StockManageModal({ product, variant, onClose }) {
  const [mode, setMode] = useState('adjust');
  const [deltaSign, setDeltaSign] = useState('add'); // add | remove
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const adjustStock      = useAdjustStock();
  const setStock          = useSetStock();
  const updateThreshold   = useUpdateThreshold();

  const isSaving = adjustStock.isPending || setStock.isPending || updateThreshold.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const num = Number(amount);

    if (mode !== 'set' && (!amount || num <= 0)) {
      setError('Enter a quantity greater than 0.');
      return;
    }
    if (mode === 'set' && (amount === '' || num < 0)) {
      setError('Enter a valid quantity (0 or more).');
      return;
    }

    try {
      if (mode === 'adjust') {
        const delta = deltaSign === 'add' ? num : -num;
        await adjustStock.mutateAsync({ productId: product.id, unit: variant.unit, delta, note });
      } else if (mode === 'set') {
        await setStock.mutateAsync({ productId: product.id, unit: variant.unit, quantity: num, note });
      } else {
        await updateThreshold.mutateAsync({ productId: product.id, unit: variant.unit, threshold: num });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="smm-overlay" onClick={onClose}>
      <div className="smm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="smm-header">
          <div>
            <h3 className="smm-title">Manage Stock</h3>
            <p className="smm-subtitle">{product.name} · {variant.unit}</p>
          </div>
          <button className="smm-close" onClick={onClose}>×</button>
        </div>

        <div className="smm-current">
          <div className="smm-current-item">
            <span className="smm-current-label">Current Stock</span>
            <span className="smm-current-value">{variant.quantity}</span>
          </div>
          <div className="smm-current-item">
            <span className="smm-current-label">Low Stock Threshold</span>
            <span className="smm-current-value">{variant.stockThreshold ?? 10}</span>
          </div>
        </div>

        <div className="smm-tabs">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`smm-tab ${mode === m.key ? 'smm-tab--active' : ''}`}
              onClick={() => { setMode(m.key); setAmount(''); setError(''); }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <form className="smm-form" onSubmit={handleSubmit}>
          {mode === 'adjust' && (
            <div className="smm-sign-row">
              <button
                type="button"
                className={`smm-sign-btn ${deltaSign === 'add' ? 'smm-sign-btn--add-active' : ''}`}
                onClick={() => setDeltaSign('add')}
              >
                + Add
              </button>
              <button
                type="button"
                className={`smm-sign-btn ${deltaSign === 'remove' ? 'smm-sign-btn--remove-active' : ''}`}
                onClick={() => setDeltaSign('remove')}
              >
                − Remove
              </button>
            </div>
          )}

          <label className="smm-label">
            {mode === 'adjust' && `Quantity to ${deltaSign === 'add' ? 'add' : 'remove'}`}
            {mode === 'set' && 'New exact quantity'}
            {mode === 'threshold' && 'New low stock threshold'}
          </label>
          <input
            className="smm-input"
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
          />

          {mode !== 'threshold' && (
            <>
              <label className="smm-label">Note (optional)</label>
              <input
                className="smm-input"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Restocked from supplier"
                maxLength={300}
              />
            </>
          )}

          {error && <p className="smm-error">{error}</p>}

          <div className="smm-footer">
            <button type="button" className="smm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="smm-btn-save" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}