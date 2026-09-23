import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart } from 'lucide-react';
import { getImageUrl, FALLBACK_PRODUCT_IMAGE } from '../../config/apiConfig';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice } from '../../utils/format';
import { colorToHex } from '../../utils/colors';
import './ProductCard.css';

function ProductCard({ product }) {
  const { isFavorite, toggleFavorite } = useWishlist();

  if (!product) return null;

  const imageUrl = getImageUrl(product.image) || FALLBACK_PRODUCT_IMAGE;
  const favorited = isFavorite(product.id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <article className="product-card">
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

        <button
          type="button"
          className={`product-wishlist-btn ${favorited ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
        </button>

        <div className="product-overlay-actions">
          <Link to={`/product/${product.id}`} className="quick-view-btn">
            <Eye size={15} /> View product
          </Link>
        </div>

        {product.category_name && (
          <span className="product-category-tag">{product.category_name}</span>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-title">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="product-price-row">
          <span className="product-price">{formatPrice(product.price)}</span>
        </div>
        {product.colors?.length > 0 && (
          <div className="product-color-dots" aria-label="Available colors">
            {product.colors.slice(0, 5).map((color) => (
              <span key={color} className="mini-dot" title={color} style={{ backgroundColor: colorToHex(color) }} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(ProductCard);
