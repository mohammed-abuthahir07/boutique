import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductGrid, { ProductGridSkeleton } from '../../components/customer/ProductGrid';
import EmptyState from '../../components/common/EmptyState';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { useCatalog } from '../../context/CatalogContext';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { colorToHex } from '../../utils/colors';
import './ShopPage.css';

const PRICE_FILTERS = [
  { id: '', label: 'Any price' },
  { id: '0-2000', label: 'Under ₹2,000' },
  { id: '2000-5000', label: '₹2,000 – ₹5,000' },
  { id: '5000-10000', label: '₹5,000 – ₹10,000' },
  { id: '10000+', label: 'Above ₹10,000' },
];

function matchesPrice(product, priceFilter) {
  if (!priceFilter) return true;
  const price = Number(product.price);
  if (priceFilter === '10000+') return price > 10000;
  const [min, max] = priceFilter.split('-').map(Number);
  return price >= min && price <= max;
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, colors, loading, error, refresh } = useCatalog();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [priceFilter, setPriceFilter] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedColor(searchParams.get('color') || '');
  }, [searchParams]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch.trim()) next.set('q', debouncedSearch.trim());
    else next.delete('q');
    if ((searchParams.get('q') || '') !== debouncedSearch.trim()) {
      setSearchParams(next, { replace: true });
    }
  }, [debouncedSearch, searchParams, setSearchParams]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const q = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category_name && p.category_name.toLowerCase().includes(q));
        const matchesCategory = !selectedCategory || String(p.category_id) === String(selectedCategory);
        const matchesColor =
          !selectedColor ||
          (p.colors || []).some((c) => c.toLowerCase() === selectedColor.toLowerCase());
        return matchesSearch && matchesCategory && matchesColor && matchesPrice(p, priceFilter);
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return b.id - a.id;
      });
  }, [products, searchTerm, selectedCategory, selectedColor, sortBy, priceFilter]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    updateParam('category', catId);
  };

  const handleColorSelect = (color) => {
    const next = selectedColor.toLowerCase() === color.toLowerCase() ? '' : color;
    setSelectedColor(next);
    updateParam('color', next);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedColor('');
    setPriceFilter('');
    setSortBy('featured');
    setSearchParams({});
  };

  const hasFilters = Boolean(selectedCategory || searchTerm || priceFilter || selectedColor);

  return (
    <div className="shop-page page-enter">
      <Breadcrumbs items={[{ label: 'Shop' }]} />

      <div className="shop-header">
        <div className="container">
          <h1 className="shop-title">Shop</h1>
          <p className="shop-subtitle">Filter by category, color, or price — just like a real store.</p>
        </div>
      </div>

      <div className="container shop-main-container">
        <div className="shop-toolbar">
          <p className="product-count-text">
            <strong>{filteredProducts.length}</strong> results
          </p>
          <select
            id="shop-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
            aria-label="Sort products"
          >
            <option value="featured">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>

        {hasFilters && (
          <div className="active-filters-bar">
            {selectedCategory && (
              <span className="active-filter-chip">
                {categories.find((c) => String(c.id) === String(selectedCategory))?.name || selectedCategory}
                <button type="button" onClick={() => handleCategorySelect('')} aria-label="Remove category">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedColor && (
              <span className="active-filter-chip">
                {selectedColor}
                <button type="button" onClick={() => handleColorSelect(selectedColor)} aria-label="Remove color">
                  <X size={12} />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="active-filter-chip">
                “{searchTerm}”
                <button type="button" onClick={() => setSearchTerm('')} aria-label="Remove search">
                  <X size={12} />
                </button>
              </span>
            )}
            {priceFilter && (
              <span className="active-filter-chip">
                {PRICE_FILTERS.find((p) => p.id === priceFilter)?.label}
                <button type="button" onClick={() => setPriceFilter('')} aria-label="Remove price">
                  <X size={12} />
                </button>
              </span>
            )}
            <button type="button" className="clear-all-link" onClick={clearAllFilters}>
              Clear all
            </button>
          </div>
        )}

        {mobileFilterOpen && (
          <button type="button" className="filter-backdrop" aria-label="Close filters" onClick={() => setMobileFilterOpen(false)} />
        )}

        <div className="shop-layout">
          <aside className={`shop-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
              <h3 className="sidebar-title">Filters</h3>
              <button type="button" className="sidebar-close-btn" onClick={() => setMobileFilterOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>

            <section className="filter-group">
              <h4 className="sidebar-title">Category</h4>
              <label className="filter-check">
                <input type="radio" name="category" checked={!selectedCategory} onChange={() => handleCategorySelect('')} />
                <span>All products</span>
                <em>{products.length}</em>
              </label>
              {categories.map((cat) => (
                <label key={cat.id} className="filter-check">
                  <input
                    type="radio"
                    name="category"
                    checked={String(selectedCategory) === String(cat.id)}
                    onChange={() => handleCategorySelect(cat.id)}
                  />
                  <span>{cat.name}</span>
                  <em>{cat.count}</em>
                </label>
              ))}
            </section>

            {colors.length > 0 && (
              <section className="filter-group">
                <h4 className="sidebar-title">Color</h4>
                <div className="color-swatch-list">
                  {colors.map((color) => {
                    const active = selectedColor.toLowerCase() === color.name.toLowerCase();
                    return (
                      <button
                        key={color.name}
                        type="button"
                        className={`color-swatch ${active ? 'active' : ''}`}
                        onClick={() => handleColorSelect(color.name)}
                        title={color.name}
                      >
                        <span className="color-dot" style={{ backgroundColor: colorToHex(color.name) }} />
                        <span>{color.name}</span>
                        <em>{color.count}</em>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="filter-group">
              <h4 className="sidebar-title">Price</h4>
              {PRICE_FILTERS.map((opt) => (
                <label key={opt.id || 'any'} className="filter-check">
                  <input
                    type="radio"
                    name="price"
                    checked={priceFilter === opt.id}
                    onChange={() => setPriceFilter(opt.id)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </section>

            <button type="button" className="btn btn-primary apply-filters-btn" onClick={() => setMobileFilterOpen(false)}>
              Show {filteredProducts.length} products
            </button>
          </aside>

          <div className="shop-products-main">
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : error ? (
              <div className="shop-error">
                <p>We could not load products. Please try again.</p>
                <button type="button" onClick={refresh} className="btn btn-outline btn-sm">Retry</button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <EmptyState
                title="No products match"
                description="Try another color, category, or price range."
                actionText="Clear filters"
                onActionClick={clearAllFilters}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mobile-shop-bar">
        <button type="button" onClick={() => setMobileFilterOpen(true)}>
          <SlidersHorizontal size={16} /> Filter
        </button>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
          <option value="featured">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
}
