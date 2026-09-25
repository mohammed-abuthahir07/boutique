import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getImageUrl, FALLBACK_PRODUCT_IMAGE } from '../../config/apiConfig';
import { formatPrice } from '../../utils/format';
import './SearchSuggestions.css';

export default function SearchSuggestions({
  open,
  query,
  loading,
  suggestions,
  highlightIndex,
  onSelectProduct,
  onViewAll,
}) {
  if (!open) return null;

  return (
    <div className="search-suggestions" role="listbox" aria-label="Search suggestions">
      {loading ? (
        <p className="search-suggestions-status">Searching...</p>
      ) : suggestions.length === 0 ? (
        <p className="search-suggestions-status">No products found</p>
      ) : (
        <ul className="search-suggestions-list">
          {suggestions.map((product, index) => {
            const imageUrl = getImageUrl(product.image) || FALLBACK_PRODUCT_IMAGE;
            return (
              <li key={product.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={highlightIndex === index}
                  className={`search-suggestion-item ${highlightIndex === index ? 'is-active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelectProduct(product)}
                >
                  <img
                    src={imageUrl}
                    alt=""
                    className="search-suggestion-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                  <span className="search-suggestion-copy">
                    <span className="search-suggestion-name">{product.name}</span>
                    {product.category_name && (
                      <span className="search-suggestion-meta">{product.category_name}</span>
                    )}
                  </span>
                  <span className="search-suggestion-price">{formatPrice(product.price)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && suggestions.length > 0 && (
        <button
          type="button"
          className={`search-suggestions-all ${highlightIndex === suggestions.length ? 'is-active' : ''}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onViewAll}
        >
          View all results →
        </button>
      )}
    </div>
  );
}
