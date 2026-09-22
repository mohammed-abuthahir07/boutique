import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import publicService from '../../services/publicService';
import ProductGrid from '../../components/customer/ProductGrid';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './ShopPage.css';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high', 'name-asc'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync URL search params
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Fetch products from public API
  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const res = await publicService.getProducts();
        if (isMounted) {
          if (res.success && Array.isArray(res.products)) {
            setProducts(res.products);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load products from atelier.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Extract distinct categories
  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.category_id && p.category_name) {
        map.set(String(p.category_id), p.category_name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search match
        const matchesSearch =
          !searchTerm.trim() ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()));

        // Category match
        const matchesCategory =
          !selectedCategory ||
          String(p.category_id) === String(selectedCategory);

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return Number(a.price) - Number(b.price);
        }
        if (sortBy === 'price-high') {
          return Number(b.price) - Number(a.price);
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        return b.id - a.id; // 'featured' (newest database ID first)
      });
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    const newParams = new URLSearchParams(searchParams);
    if (catId) {
      newParams.set('category', catId);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('q', val.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="shop-page">
      <Breadcrumbs items={[{ label: 'Shop Collection' }]} />

      {/* Page Header */}
      <div className="shop-header">
        <div className="container shop-header-container">
          <div className="shop-header-content">
            <span className="section-subtitle">Pret-a-Porter & Couture</span>
            <h1 className="shop-title">The Complete Collection</h1>
            <p className="shop-subtitle">
              Browse our handcrafted silhouettes, from flowing organza dresses to meticulously tailored ethnic ensembles.
            </p>
          </div>
        </div>
      </div>

      <div className="container shop-main-container">
        {/* Toolbar */}
        <div className="shop-toolbar">
          <div className="toolbar-left">
            <button
              type="button"
              className="mobile-filter-trigger"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              <SlidersHorizontal size={16} /> Filters
              {(selectedCategory || searchTerm) && <span className="filter-active-dot"></span>}
            </button>
            <p className="product-count-text">
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> creations
            </p>
          </div>

          <div className="toolbar-right">
            {/* Search within shop */}
            <div className="shop-search-box">
              <Search size={16} className="shop-search-icon" />
              <input
                type="text"
                placeholder="Search collection..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="shop-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="shop-search-clear"
                  onClick={() => handleSearchChange({ target: { value: '' } })}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="sort-box">
              <label htmlFor="shop-sort" className="sort-label">
                <ArrowUpDown size={14} /> Sort:
              </label>
              <select
                id="shop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="featured">Featured / Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Bar */}
        {(selectedCategory || searchTerm) && (
          <div className="active-filters-bar">
            <span className="active-filters-title">Active Filters:</span>
            {selectedCategory && (
              <span className="active-filter-chip">
                Category: {categories.find((c) => String(c.id) === String(selectedCategory))?.name || selectedCategory}
                <button type="button" onClick={() => handleCategorySelect('')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="active-filter-chip">
                Query: "{searchTerm}"
                <button type="button" onClick={() => handleSearchChange({ target: { value: '' } })}>
                  <X size={12} />
                </button>
              </span>
            )}
            <button type="button" className="clear-all-link" onClick={clearAllFilters}>
              Clear All
            </button>
          </div>
        )}

        {/* Layout Grid */}
        <div className="shop-layout">
          {/* Category Filter Sidebar */}
          <aside className={`shop-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
              <h3 className="sidebar-title">Categories</h3>
              <button
                type="button"
                className="sidebar-close-btn"
                onClick={() => setMobileFilterOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="category-filter-list">
              <button
                type="button"
                className={`cat-filter-btn ${!selectedCategory ? 'active' : ''}`}
                onClick={() => handleCategorySelect('')}
              >
                <span>All Collections</span>
                <span className="cat-count-badge">{products.length}</span>
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => String(p.category_id) === String(cat.id)).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-filter-btn ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(cat.id)}
                  >
                    <span>{cat.name}</span>
                    <span className="cat-count-badge">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="sidebar-craft-promo">
              <span className="promo-tag">Bespoke Atelier</span>
              <p className="promo-text">
                Every piece is tailored to perfection. For customized sizing or bridal orders, speak with our styling team.
              </p>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="shop-products-main">
            {loading ? (
              <Loader message="Retrieving boutique pieces..." />
            ) : error ? (
              <div className="shop-error">
                <p>{error}</p>
                <button type="button" onClick={() => window.location.reload()} className="btn btn-outline btn-sm">
                  Retry
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <EmptyState
                title="No creations match your filter"
                description="We could not find any garments matching your search or category selection. Try selecting another filter or clearing your query."
                actionText="View All Creations"
                onActionClick={clearAllFilters}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
