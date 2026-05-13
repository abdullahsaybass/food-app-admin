// src/features/products/components/ProductCard.jsx

import './ProductCard.css';

export default function ProductCard({ product, isSelected, onClick }) {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div
      className={`pcard ${isSelected ? 'pcard--selected' : ''} ${!product.inStock ? 'pcard--oos' : ''}`}
      onClick={onClick}
    >
      {/* favourite */}
      <button className="pcard-fav" onClick={(e) => e.stopPropagation()}>
        <HeartIcon />
      </button>

      {/* discount badge */}
      {discount > 0 && (
        <span className="pcard-discount">-{discount}%</span>
      )}

      {/* image */}
      <div className="pcard-img-wrap">
        <img src={product.image} alt={product.name} className="pcard-img" />
        {!product.inStock && <div className="pcard-oos-overlay">Out of Stock</div>}
      </div>

      {/* info */}
      <div className="pcard-info">
        <p className="pcard-name">{product.name}</p>
        <p className="pcard-stock">{product.stock} in stock</p>
      </div>

      {/* price row */}
      <div className="pcard-price-row">
        <div>
          <span className="pcard-price">${product.price.toFixed(2)}</span>
          <span className="pcard-original">${product.originalPrice.toFixed(2)}</span>
        </div>
        <button
          className="pcard-add"
          onClick={(e) => e.stopPropagation()}
          disabled={!product.inStock}
        >
          +
        </button>
      </div>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}