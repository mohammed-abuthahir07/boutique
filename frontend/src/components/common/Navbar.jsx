import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, LogOut, Menu, Package, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCatalog } from '../../context/CatalogContext';
import { useToast } from '../../context/ToastContext';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { filterSearchProducts } from '../../utils/productSearch';
import { syncStoreHeaderHeight } from '../../utils/storeHeaderHeight';
import SearchSuggestions from './SearchSuggestions';
import './Navbar.css';

const SEARCH_MIN_LENGTH = 2;
const SEARCH_SUGGESTION_LIMIT = 5;

export default function Navbar() {
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { categories, products, loading: catalogLoading } = useCatalog();
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchWrapRef = useRef(null);
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setSuggestionsOpen(false);
    setHighlightIndex(-1);
    if (location.pathname !== '/shop') {
      setSearchQuery('');
    } else {
      setSearchQuery(searchParams.get('q') || '');
    }
  }, [location.pathname, searchParams]);

  const typedQuery = searchQuery.trim();
  const readyQuery = debouncedSearch.trim();
  const canSuggest = typedQuery.length >= SEARCH_MIN_LENGTH;
  const querySettled = canSuggest && typedQuery === readyQuery;
  const suggestions = useMemo(() => {
    if (!querySettled) return [];
    return filterSearchProducts(products, readyQuery, SEARCH_SUGGESTION_LIMIT);
  }, [querySettled, products, readyQuery]);
  const suggestionsLoading = canSuggest && (!querySettled || (catalogLoading && products.length === 0));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      syncStoreHeaderHeight();
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    syncStoreHeaderHeight();
    return () => {
      document.body.style.overflow = previousOverflow && previousOverflow !== 'hidden' ? previousOverflow : '';
      syncStoreHeaderHeight();
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
        setHighlightIndex(-1);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
        setSuggestionsOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const goToFullSearch = (value = searchQuery) => {
    const q = value.trim();
    setSuggestionsOpen(false);
    setHighlightIndex(-1);
    setMobileMenuOpen(false);
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (suggestionsOpen && highlightIndex >= 0 && highlightIndex < suggestions.length) {
      openSuggestedProduct(suggestions[highlightIndex]);
      return;
    }
    if (suggestionsOpen && highlightIndex === suggestions.length && querySettled) {
      goToFullSearch(typedQuery);
      return;
    }
    goToFullSearch();
  };

  const openSuggestedProduct = (product) => {
    if (!product?.id) return;
    setSuggestionsOpen(false);
    setHighlightIndex(-1);
    setMobileMenuOpen(false);
    navigate(`/product/${product.id}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSuggestionsOpen(false);
      setHighlightIndex(-1);
      return;
    }

    if (e.key === 'Enter') {
      handleSearchSubmit(e);
      return;
    }

    if (!suggestionsOpen || !canSuggest) return;

    const lastIndex = suggestions.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((current) => (current + 1 > lastIndex ? 0 : current + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((current) => (current <= 0 ? lastIndex : current - 1));
    }
  };

  const requireSignIn = (event, path) => {
    if (isAuthenticated) return;
    event.preventDefault();
    info('Please sign in to continue');
    navigate(`/login?redirect=${encodeURIComponent(path)}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestionsOpen(false);
    setHighlightIndex(-1);
    if (location.pathname === '/shop') {
      navigate('/shop');
    }
    searchRef.current?.focus();
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''} ${mobileMenuOpen ? 'header-menu-open' : ''}`}>
      <div className="announcement-bar">
        <div className="container announcement-content">
          <span>Free insured delivery across India · Easy returns · Secure checkout</span>
        </div>
      </div>

      <div className="navbar-wrapper">
        <div className="container navbar-container">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="brand-logo" aria-label="Maison Boutique home">
            <span className="logo-main">SRI ANNAI</span>
            <span className="logo-sub">BOUTIQUE</span>
          </Link>

          <form onSubmit={handleSearchSubmit} className="header-search" role="search" ref={searchWrapRef}>
            <Search size={18} className="header-search-icon" aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightIndex(-1);
                setSuggestionsOpen(e.target.value.trim().length >= SEARCH_MIN_LENGTH);
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= SEARCH_MIN_LENGTH) {
                  setSuggestionsOpen(true);
                }
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search for dresses, categories, styles..."
              className="header-search-input"
              aria-label="Search products"
              aria-autocomplete="list"
              aria-expanded={suggestionsOpen}
              autoComplete="off"
            />
            {searchQuery && (
              <button type="button" className="header-search-clear" onClick={clearSearch} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
            <button type="submit" className="header-search-submit">
              Search
            </button>
            <SearchSuggestions
              open={suggestionsOpen && canSuggest}
              query={typedQuery}
              loading={suggestionsLoading}
              suggestions={suggestions}
              highlightIndex={highlightIndex}
              onSelectProduct={openSuggestedProduct}
              onViewAll={() => goToFullSearch(typedQuery)}
            />
          </form>

          <div className="nav-actions">
            <Link
              to="/wishlist"
              className="action-btn"
              aria-label="Wishlist"
              onClick={(e) => requireSignIn(e, '/wishlist')}
            >
              <Heart size={20} />
              <span className="action-label">Wishlist</span>
              {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
            </Link>

            <Link
              to="/cart"
              className="action-btn"
              aria-label="Cart"
              onClick={(e) => requireSignIn(e, '/cart')}
            >
              <ShoppingBag size={20} />
              <span className="action-label">Cart</span>
              {itemCount > 0 && <span className="action-badge">{itemCount}</span>}
            </Link>

            <div className="user-dropdown-wrap" ref={dropdownRef}>
              <button
                className="action-btn user-btn"
                onClick={() => setUserDropdownOpen((open) => !open)}
                aria-label="Account menu"
                aria-expanded={userDropdownOpen}
              >
                <User size={20} />
                <span className="action-label">
                  {isAuthenticated && customer ? customer.name.split(' ')[0] : 'Account'}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu" role="menu">
                  {isAuthenticated && customer ? (
                    <>
                      <div className="dropdown-header">
                        <p className="dropdown-user-name">{customer.name}</p>
                        <p className="dropdown-user-email">{customer.email}</p>
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/profile" className="dropdown-item" role="menuitem">
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/orders" className="dropdown-item" role="menuitem">
                        <Package size={16} /> Orders
                      </Link>
                      <Link to="/wishlist" className="dropdown-item" role="menuitem">
                        <Heart size={16} /> Wishlist
                      </Link>
                      <Link to="/cart" className="dropdown-item" role="menuitem">
                        <ShoppingBag size={16} /> Cart
                      </Link>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item logout-btn" onClick={logout} role="menuitem">
                        <LogOut size={16} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="dropdown-header">
                        <p className="dropdown-user-name">Welcome</p>
                        <p className="dropdown-user-email">Sign in for a faster checkout</p>
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/login" className="dropdown-item primary-link" role="menuitem">
                        Sign In
                      </Link>
                      <Link to="/register" className="dropdown-item" role="menuitem">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="category-strip">
        <div className="container category-strip-inner">
          <nav className="nav-links" aria-label="Primary">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/shop" end className={({ isActive }) => `nav-link ${isActive && !searchParams.get('category') ? 'active' : ''}`}>
              All Products
            </NavLink>
            {categories.slice(0, 6).map((cat) => (
              <NavLink
                key={cat.id}
                to={`/shop?category=${encodeURIComponent(cat.id)}`}
                className={() => `nav-link ${String(searchParams.get('category')) === String(cat.id) ? 'active' : ''}`}
              >
                {cat.name}
              </NavLink>
            ))}
            <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Categories
            </NavLink>
            <NavLink to="/gallery" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Gallery
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              About
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Contact
            </NavLink>
          </nav>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <form onSubmit={handleSearchSubmit} className="mobile-search" role="search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
            />
            <button type="submit" className="btn btn-accent btn-sm">Go</button>
          </form>
          <nav
            className="mobile-nav"
            aria-label="Mobile"
            onClick={(event) => {
              if (event.target.closest('a, button')) {
                setMobileMenuOpen(false);
              }
            }}
          >
            <NavLink to="/" className="mobile-nav-link">Home</NavLink>
            <NavLink to="/shop" className="mobile-nav-link">Shop All</NavLink>
            {categories.map((cat) => (
              <NavLink key={cat.id} to={`/shop?category=${encodeURIComponent(cat.id)}`} className="mobile-nav-link">
                {cat.name}
              </NavLink>
            ))}
            <NavLink to="/categories" className="mobile-nav-link">Categories</NavLink>
            <NavLink to="/gallery" className="mobile-nav-link">Gallery</NavLink>
            <NavLink to="/about" className="mobile-nav-link">About</NavLink>
            <NavLink to="/contact" className="mobile-nav-link">Contact</NavLink>
            <div className="mobile-nav-divider" />
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className="mobile-nav-link">Profile</NavLink>
                <NavLink to="/orders" className="mobile-nav-link">Orders</NavLink>
                <NavLink to="/wishlist" className="mobile-nav-link" onClick={(e) => requireSignIn(e, '/wishlist')}>
                  Wishlist ({wishlistCount})
                </NavLink>
                <NavLink to="/cart" className="mobile-nav-link" onClick={(e) => requireSignIn(e, '/cart')}>
                  Cart ({itemCount})
                </NavLink>
                <button className="mobile-nav-link mobile-logout" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="mobile-nav-link font-semibold">Sign In</NavLink>
                <NavLink to="/register" className="mobile-nav-link">Create Account</NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
