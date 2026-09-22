import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { getImageUrl, FALLBACK_PRODUCT_IMAGE } from '../../config/apiConfig';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './WishlistPage.css';

export default function WishlistPage() {
  const { favorites, loading, toggleFavorite } = useWishlist();

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="wishlist-page">
      <Breadcrumbs items={[{ label: 'Client Account', link: '/profile' }, { label: 'Private Wishlist' }]} />

      <div className="container wishlist-container">
        <div className="wishlist-header">
          <span className="section-subtitle">Private Curations</span>
          <h1 className="wishlist-title">Your Private Wishlist</h1>
          <p className="wishlist-subtitle">
            Saved silhouettes reserved for your discerning consideration. Review fit options or commission to your bag.
          </p>
        </div>

        {loading ? (
          <Loader message="Accessing your private wishlist..." />
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Explore our atelier's exquisite couture and pret-a-porter pieces. Click the heart icon on any design to save it to your wishlist."
            actionText="Discover Creations"
            actionLink="/shop"
          />
        ) : (
          <div className="wishlist-grid">
            {favorites.map((item) => {
              const productId = item.product_id;
              const imageUrl = getImageUrl(item.image) || FALLBACK_PRODUCT_IMAGE;

              return (
                <div key={item.id || productId} className="wishlist-card card">
                  <div className="wishlist-image-wrap">
                    <Link to={`/product/${productId}`}>
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="wishlist-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_PRODUCT_IMAGE;
                        }}
                      />
                    </Link>
                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      onClick={() => toggleFavorite(productId)}
                      aria-label="Remove from wishlist"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                    {item.category_name && (
                      <span className="wishlist-category-tag">{item.category_name}</span>
                    )}
                  </div>

                  <div className="wishlist-card-info">
                    <h3 className="wishlist-item-title">
                      <Link to={`/product/${productId}`}>{item.name}</Link>
                    </h3>
                    <p className="wishlist-item-price">{formatPrice(item.price)}</p>

                    <Link to={`/product/${productId}`} className="btn btn-accent btn-sm wishlist-view-btn">
                      View Silhouette & Options <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
