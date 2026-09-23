import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  Tag,
  Package,
  Boxes,
  BarChart3,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/admin/dashboard" className="admin-brand-link">
            <span className="brand-title">MAISON</span>
            <span className="brand-portal">ADMIN</span>
          </Link>
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          <div className="nav-section-lbl">Management</div>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Layers size={18} />
            <span>Categories</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <ShoppingBag size={18} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/admin/offers"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Tag size={18} />
            <span>Offers</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Package size={18} />
            <span>Orders</span>
          </NavLink>

          <div className="nav-section-lbl">Reports</div>
          <NavLink
            to="/admin/inventory"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Boxes size={18} />
            <span>Inventory</span>
          </NavLink>

          <NavLink
            to="/admin/analytics"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={18} />
            <span>Customers</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" target="_blank" rel="noopener noreferrer" className="storefront-link">
            <ExternalLink size={15} />
            <span>View store</span>
          </Link>
          <button type="button" onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={22} />
            </button>
            <div className="admin-breadcrumb-info">
              <span className="portal-badge">
                <Shield size={12} /> Administrator
              </span>
            </div>
          </div>

          <div className="header-right">
            <div className="admin-profile-pill">
              <div className="admin-avatar-initial">
                {admin?.name ? admin.name[0].toUpperCase() : 'A'}
              </div>
              <div className="admin-text-wrap">
                <span className="admin-name">{admin?.name || 'Administrator'}</span>
                <span className="admin-email">{admin?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route View */}
        <main className="admin-page-content page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
