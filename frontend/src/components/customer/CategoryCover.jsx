import React, { useState } from 'react';
import { getCategoryImageUrl } from '../../utils/categoryImage';

export default function CategoryCover({ category, alt = '', className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = getCategoryImageUrl(category);

  if (!src || failed) {
    return <div className={`category-cover-fallback ${className}`.trim()} aria-hidden="true" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`category-cover-photo ${className}`.trim()}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
