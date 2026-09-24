import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductGrid, { ProductGridSkeleton } from '../../components/customer/ProductGrid';
import EmptyState from '../../components/common/EmptyState';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { useCatalog } from '../../context/CatalogContext';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { colorToHex } from '../../utils/colors';
import './ShopPage.css';

const PAGE_SIZE = 20;

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
  const { products, categories, colors, sizes, loading, error, refresh } = useCatalog();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [priceFilter, setPriceFilter] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isMobileShop, setIsMobileShop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 992px)').matches
  );
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get('page')) || 1));
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedColor(searchParams.get('color') || '');
    setSelectedSize(searchParams.get('size') || '');
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
        const matchesSize =
          !selectedSize ||
          (p.sizes || []).some((s) => String(s).toLowerCase() === selectedSize.toLowerCase());
        return matchesSearch && matchesCategory && matchesColor && matchesSize && matchesPrice(p, priceFilter);
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return b.id - a.id;
      });
  }, [products, searchTerm, selectedCategory, selectedColor, selectedSize, sortBy, priceFilter]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedColor, selectedSize, priceFilter, searchTerm, sortBy]);

  useEffect(() => {
    const header = document.querySelector('.header');
    const syncHeader = () => {
      document.documentElement.style.setProperty('--store-header-h', `${header?.offsetHeight || 120}px`);
    };
    syncHeader();
    window.addEventListener('resize', syncHeader);
    return () => window.removeEventListener('resize', syncHeader);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 992px)');
    const onChange = () => {
      setIsMobileShop(mq.matches);
      if (!mq.matches) setMobileFilterOpen(false);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!mobileFilterOpen || !isMobileShop) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileFilterOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow && previousOverflow !== 'hidden' ? previousOverflow : '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileFilterOpen, isMobileShop]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (nextPage) => {
    const safe = Math.min(Math.max(1, nextPage), totalPages);
    setPage(safe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    setSelectedSize('');
    setPriceFilter('');
    setSortBy('featured');
    setSearchParams({});
  };

  const hasFilters = Boolean(selectedCategory || searchTerm || priceFilter || selectedColor || selectedSize);
  const closeMobileFilters = () => setMobileFilterOpen(false);

  const handleSizeSelect = (size) => {
    const next = selectedSize.toLowerCase() === String(size).toLowerCase() ? '' : size;
    setSelectedSize(next);
    updateParam('size', next);
  };

  const filterPanel = (
    <aside className={`shop-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`} aria-label="Product filters">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Filters</h3>
        <button type="button" className="sidebar-close-btn" onClick={closeMobileFilters} aria-label="Close filters">
          <X size={20} />
        </button>
      </div>

      <div className="shop-filter-body">
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

        {sizes.length > 0 && (
          <section className="filter-group">
            <h4 className="sidebar-title">Size</h4>
            <div className="size-chip-list">
              {sizes.map((size) => {
                const active = selectedSize.toLowerCase() === String(size.name).toLowerCase();
                return (
                  <button
                    key={size.name}
                    type="button"
                    className={`size-chip ${active ? 'active' : ''}`}
                    onClick={() => handleSizeSelect(size.name)}
                  >
                    {size.name}
                    <em>{size.count}</em>
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
      </div>

      <div className="shop-filter-footer">
        <button type="button" className="clear-all-link shop-filter-clear" onClick={clearAllFilters} disabled={!hasFilters}>
          Clear all
        </button>
        <button type="button" className="btn btn-primary apply-filters-btn" onClick={closeMobileFilters}>
          Show {filteredProducts.length} products
        </button>
      </div>
    </aside>
  );

  return (
    <div className="shop-page page-enter">
      <Breadcrumbs items={[{ label: 'Shop' }]} />

      <div className="shop-header">
        <div className="container">
          <h1 className="shop-title">Shop</h1>
        </div>
      </div>

      <div className="container shop-toolbar-wrap">
        <div className="shop-toolbar">
          <p className="product-count-text">
            <strong>{filteredProducts.length}</strong> results
            {filteredProducts.length > PAGE_SIZE && (
              <span> · page {currentPage} of {totalPages}</span>
            )}
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
      </div>

      <div className="shop-controls">
        {hasFilters && (
          <div className="container">
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
              {selectedSize && (
                <span className="active-filter-chip">
                  Size {selectedSize}
                  <button type="button" onClick={() => handleSizeSelect(selectedSize)} aria-label="Remove size">
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
          </div>
        )}

        <div className="mobile-shop-bar">
          <button type="button" onClick={() => setMobileFilterOpen(true)}>
            <SlidersHorizontal size={16} /> Filter
          </button>
          <span className="mobile-result-count">{filteredProducts.length} results</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
            <option value="featured">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="container shop-main-container">
        <div className="shop-layout">
          {!isMobileShop && filterPanel}

          <div className="shop-products-main">
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : error ? (
              <div className="shop-error">
                <p>We could not load products. Please try again.</p>
                <button type="button" onClick={refresh} className="btn btn-outline btn-sm">Retry</button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <ProductGrid products={pagedProducts} />
                {totalPages > 1 && (
                  <nav className="shop-pagination" aria-label="Product pages">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={currentPage <= 1}
                      onClick={() => goToPage(currentPage - 1)}
                    >
                      Previous
                    </button>
                    <span className="shop-page-status">
                      {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length}
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <EmptyState
                title="No products match"
                description="Try another size, color, category, or price range."
                actionText="Clear filters"
                onActionClick={clearAllFilters}
              />
            )}
          </div>
        </div>
      </div>

      {isMobileShop && mobileFilterOpen && typeof document !== 'undefined' && createPortal(
        <div className="shop-filter-layer" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" className="filter-backdrop" aria-label="Close filters" onClick={closeMobileFilters} />
          {filterPanel}
        </div>,
        document.body
      )}
    </div>
  );
}
