import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut, Package, Shield } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import './Navbar.css';

export default function Navbar() {
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      {/* Top Luxury Announcement Bar */}
      <div className="announcement-bar">
        <div className="container announcement-content">
          <span>Complimentary Express Delivery on Orders Across India • Haute Couture & Pret-a-Porter</span>
          <Link to="/admin/login" className="admin-portal-link" title="Admin Portal">
            <Shield size={12} /> Admin
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="navbar-wrapper">
        <div className="container navbar-container">
          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Boutique Brand Logo */}
          <Link to="/" className="brand-logo">
            <span className="logo-main">MAISON</span>
            <span className="logo-sub">BOUTIQUE</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Shop
            </NavLink>
            <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Categories
            </NavLink>
            <NavLink to="/gallery" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Lookbook
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              About
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Contact
            </NavLink>
          </nav>

          {/* Nav Actions */}
          <div className="nav-actions">
            {/* Search Trigger */}
            <button
              className="action-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              title="Search collection"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="action-btn" aria-label="Wishlist" title="My Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="action-btn" aria-label="Shopping Cart" title="Shopping Cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && <span className="action-badge">{itemCount}</span>}
            </Link>

            {/* User Account / Profile */}
            <div className="user-dropdown-wrap">
              <button
                className="action-btn user-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-label="Account menu"
              >
                <User size={20} />
                {isAuthenticated && customer && (
                  <span className="user-greeting">{customer.name.split(' ')[0]}</span>
                )}
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  {isAuthenticated && customer ? (
                    <>
                      <div className="dropdown-header">
                        <p className="dropdown-user-name">{customer.name}</p>
                        <p className="dropdown-user-email">{customer.email}</p>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link to="/profile" className="dropdown-item">
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/orders" className="dropdown-item">
                        <Package size={16} /> My Orders
                      </Link>
                      <Link to="/wishlist" className="dropdown-item">
                        <Heart size={16} /> My Wishlist
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item logout-btn" onClick={logout}>
                        <LogOut size={16} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="dropdown-header">
                        <p className="dropdown-user-name">Welcome to Maison</p>
                        <p className="dropdown-user-email">Sign in for the best experience</p>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link to="/login" className="dropdown-item primary-link">
                        Sign In
                      </Link>
                      <Link to="/register" className="dropdown-item">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Search Drawer */}
        {searchOpen && (
          <div className="search-drawer">
            <div className="container">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <Search size={22} className="search-form-icon" />
                <input
                  type="text"
                  placeholder="Search dresses, kurtas, couture, colors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="search-input"
                />
                <button type="submit" className="btn btn-accent btn-sm">
                  Search
                </button>
                <button
                  type="button"
                  className="search-close-btn"
                  onClick={() => setSearchOpen(false)}
                >
                  <X size={20} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav">
            <NavLink to="/" className="mobile-nav-link">
              Home
            </NavLink>
            <NavLink to="/shop" className="mobile-nav-link">
              Shop All
            </NavLink>
            <NavLink to="/categories" className="mobile-nav-link">
              Categories
            </NavLink>
            <NavLink to="/gallery" className="mobile-nav-link">
              Lookbook
            </NavLink>
            <NavLink to="/about" className="mobile-nav-link">
              Our Story
            </NavLink>
            <NavLink to="/contact" className="mobile-nav-link">
              Contact & Atelier
            </NavLink>
            <div className="mobile-nav-divider"></div>
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className="mobile-nav-link">
                  My Profile ({customer?.name})
                </NavLink>
                <NavLink to="/orders" className="mobile-nav-link">
                  My Orders
                </NavLink>
                <NavLink to="/wishlist" className="mobile-nav-link">
                  Wishlist ({wishlistCount})
                </NavLink>
                <button className="mobile-nav-link mobile-logout" onClick={logout}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="mobile-nav-link font-semibold">
                  Sign In
                </NavLink>
                <NavLink to="/register" className="mobile-nav-link">
                  Create Account
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
