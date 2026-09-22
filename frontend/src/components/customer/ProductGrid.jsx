import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid({ products = [] }) {
  if (!products.length) return null;

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
