import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { getImageUrl, FALLBACK_PRODUCT_IMAGE } from '../../config/apiConfig';
import QuantitySelector from './QuantitySelector';
import './CartItem.css';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  if (!item) return null;

  const imageUrl = getImageUrl(item.image) || FALLBACK_PRODUCT_IMAGE;

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const maxAllowed = item.available_stock ? Number(item.available_stock) : 99;

  return (
    <div className="cart-item-row">
      {/* Thumbnail */}
      <Link to={`/product/${item.product_id}`} className="cart-item-img-wrap">
        <img
          src={imageUrl}
          alt={item.product_name}
          className="cart-item-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_PRODUCT_IMAGE;
          }}
        />
      </Link>

      {/* Details */}
      <div className="cart-item-info">
        <div className="cart-item-header">
          <h4 className="cart-item-title">
            <Link to={`/product/${item.product_id}`}>{item.product_name}</Link>
          </h4>
          <button
            type="button"
            className="cart-item-remove-btn"
            onClick={() => onRemove(item.cart_item_id)}
            aria-label="Remove item from bag"
            title="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Variant specifics */}
        <div className="cart-item-meta">
          {item.color && (
            <span className="cart-meta-tag">
              <strong>Shade:</strong> {item.color}
            </span>
          )}
          {item.size && (
            <span className="cart-meta-tag">
              <strong>Fit:</strong> {item.size}
            </span>
          )}
          {item.available_stock !== undefined && (
            <span className="cart-meta-tag stock-info">
              Stock: {item.available_stock}
            </span>
          )}
        </div>

        {/* Price & Quantity Footer */}
        <div className="cart-item-bottom">
          <div className="cart-item-unit-price">
            {formatPrice(item.price)}
          </div>

          <div className="cart-item-qty-wrap">
            <QuantitySelector
              quantity={item.quantity}
              onChange={(newQty) => onUpdateQuantity(item.cart_item_id, newQty)}
              max={maxAllowed}
              min={1}
            />
          </div>

          <div className="cart-item-subtotal">
            <span className="subtotal-label">Subtotal:</span>
            <span className="subtotal-amount">{formatPrice(item.subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
