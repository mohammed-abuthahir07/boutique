import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ArrowRight } from 'lucide-react';
import { getImageUrl, FALLBACK_PRODUCT_IMAGE } from '../../config/apiConfig';
import { useWishlist } from '../../context/WishlistContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { isFavorite, toggleFavorite } = useWishlist();

  if (!product) return null;

  const imageUrl = getImageUrl(product.image) || FALLBACK_PRODUCT_IMAGE;
  const favorited = isFavorite(product.id);

  // Format currency
  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <Link to={`/product/${product.id}`} className="product-image-link">
          <img
            src={imageUrl}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_PRODUCT_IMAGE;
            }}
          />
        </Link>

        {/* Wishlist Button */}
        <button
          type="button"
          className={`product-wishlist-btn ${favorited ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
          title={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
        </button>

        {/* Quick View Link */}
        <div className="product-overlay-actions">
          <Link to={`/product/${product.id}`} className="quick-view-btn">
            <Eye size={15} /> Discover Silhouette
          </Link>
        </div>

        {/* Category Pill */}
        {product.category_name && (
          <span className="product-category-tag">{product.category_name}</span>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-title">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        {product.description && (
          <p className="product-brief">{product.description}</p>
        )}

        <div className="product-price-row">
          <span className="product-price">{formatPrice(product.price)}</span>
          <Link to={`/product/${product.id}`} className="product-link-arrow">
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
