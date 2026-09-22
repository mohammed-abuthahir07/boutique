import React, { useState, useEffect } from 'react';
import { getImageUrl, FALLBACK_PRODUCT_IMAGE } from '../../config/apiConfig';
import './ProductGallery.css';

export default function ProductGallery({ images = [], altText = 'Product Image' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset index if image list changes (e.g. When color changes)
  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  // Normalize image urls
  const resolvedImages = images.length > 0
    ? images.map((img) => (typeof img === 'string' ? getImageUrl(img) : getImageUrl(img.image)))
    : [FALLBACK_PRODUCT_IMAGE];

  const currentImage = resolvedImages[selectedIndex] || resolvedImages[0] || FALLBACK_PRODUCT_IMAGE;

  return (
    <div className="product-gallery">
      {/* Main Image Stage */}
      <div className="gallery-main-wrap">
        <img
          src={currentImage}
          alt={altText}
          className="gallery-main-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_PRODUCT_IMAGE;
          }}
        />
      </div>

      {/* Thumbnails */}
      {resolvedImages.length > 1 && (
        <div className="gallery-thumbs-row">
          {resolvedImages.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              className={`gallery-thumb-btn ${idx === selectedIndex ? 'active' : ''}`}
              onClick={() => setSelectedIndex(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={imgUrl}
                alt={`${altText} thumbnail ${idx + 1}`}
                className="gallery-thumb-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_PRODUCT_IMAGE;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
