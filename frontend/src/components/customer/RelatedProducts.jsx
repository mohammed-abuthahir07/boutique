import React, { useMemo } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import ProductGrid, { ProductGridSkeleton } from './ProductGrid';
import './RelatedProducts.css';

const MAX_RELATED = 8;

export default function RelatedProducts({ productId, categoryId }) {
  const { products, loading } = useCatalog();

  const related = useMemo(() => {
    if (!productId || !categoryId) return [];

    const seen = new Set();
    const matches = [];

    for (const product of products) {
      if (!product?.id) continue;
      if (String(product.category_id) !== String(categoryId)) continue;
      if (String(product.id) === String(productId)) continue;

      const uniqueId = Number(product.id);
      if (seen.has(uniqueId)) continue;
      seen.add(uniqueId);
      matches.push(product);

      if (matches.length >= MAX_RELATED) break;
    }

    return matches;
  }, [products, productId, categoryId]);

  if (!productId || !categoryId) return null;

  if (loading && products.length === 0) {
    return (
      <section className="related-products-section" aria-busy="true">
        <div className="related-products-header">
          <h2 className="related-products-title">You May Also Like</h2>
          <p className="related-products-subtitle">Finding similar pieces from this collection</p>
        </div>
        <ProductGridSkeleton count={4} />
      </section>
    );
  }

  if (!related.length) return null;

  return (
    <section className="related-products-section" aria-label="Related products">
      <div className="related-products-header">
        <h2 className="related-products-title">Related Products</h2>
        <p className="related-products-subtitle">More pieces from the same collection</p>
      </div>
      <ProductGrid products={related} />
    </section>
  );
}
