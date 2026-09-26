import React from 'react';
import { Link } from 'react-router-dom';
import { ProductGridSkeleton } from '../../components/customer/ProductGrid';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import EmptyState from '../../components/common/EmptyState';
import { useCatalog } from '../../context/CatalogContext';
import CategoryCover from '../../components/customer/CategoryCover';
import './CategoriesPage.css';

export default function CategoriesPage() {
  const { categories, loading, error, refresh } = useCatalog();

  return (
    <div className="categories-page">
      <Breadcrumbs items={[{ label: 'Categories' }]} />

      <div className="categories-header">
        <div className="container">
          <span className="section-subtitle">Browse</span>
          <h1 className="categories-title">Shop by category</h1>
          <p className="categories-subtitle">
            Categories are taken from live products. Open a category to shop that collection.
          </p>
        </div>
      </div>

      <div className="container categories-main">
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : error ? (
          <div className="shop-error">
            <p>Unable to load categories right now.</p>
            <button type="button" onClick={refresh} className="btn btn-outline btn-sm">Retry</button>
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Categories appear here once products are published."
            actionText="Visit shop"
            actionLink="/shop"
          />
        ) : (
          <div className="categories-grid-page">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${encodeURIComponent(cat.id)}`} className="category-page-tile">
                <div className="category-page-media">
                  <CategoryCover category={cat} alt={cat.name} />
                </div>
                <div className="category-page-content">
                  <h3 className="category-page-title">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
