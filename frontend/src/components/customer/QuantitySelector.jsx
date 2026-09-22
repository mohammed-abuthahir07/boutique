import React from 'react';
import { Minus, Plus } from 'lucide-react';
import './QuantitySelector.css';

export default function QuantitySelector({
  quantity = 1,
  onChange,
  max = 99,
  min = 1,
  disabled = false,
}) {
  const handleDecrement = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="quantity-control-wrap">
      <div className={`quantity-selector ${disabled ? 'disabled' : ''}`}>
        <button
          type="button"
          className="qty-btn"
          onClick={handleDecrement}
          disabled={disabled || quantity <= min}
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>

        <span className="qty-value">{quantity}</span>

        <button
          type="button"
          className="qty-btn"
          onClick={handleIncrement}
          disabled={disabled || quantity >= max}
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>

      {max < 10 && max > 0 && (
        <span className="stock-alert-pill">Only {max} available</span>
      )}
    </div>
  );
}
