import React from 'react';
import './SizeSelector.css';

export default function SizeSelector({
  variants = [],
  selectedVariant,
  onSelectVariant,
}) {
  if (!variants || variants.length === 0) {
    return (
      <div className="size-selector empty">
        <span className="selector-label">Size:</span>
        <p className="no-sizes-msg">No sizing configurations available for this shade.</p>
      </div>
    );
  }

  return (
    <div className="size-selector">
      <div className="selector-header">
        <span className="selector-label">Artisanal Size:</span>
        <span className="selector-current-value">
          {selectedVariant ? `${selectedVariant.size} (${selectedVariant.stock > 0 ? `${selectedVariant.stock} left in atelier` : 'Out of Stock'})` : 'Choose your fit'}
        </span>
      </div>

      <div className="size-buttons-wrap">
        {variants.map((v) => {
          const isSelected = selectedVariant?.id === v.id;
          const isOutOfStock = Number(v.stock) <= 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={isOutOfStock}
              className={`size-btn ${isSelected ? 'active' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
              onClick={() => onSelectVariant(v)}
              aria-label={`Size ${v.size}${isOutOfStock ? ' - Out of Stock' : ''}`}
            >
              <span className="size-text">{v.size}</span>
              {isOutOfStock && <span className="size-strike-line"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
