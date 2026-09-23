import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, LogOut, Package, ShoppingBag, User } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import './AccountNav.css';

export default function AccountNav() {
  const { logout, customer } = useCustomerAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  return (
    <aside className="account-nav" aria-label="Account">
      <div className="account-nav-intro">
        <p className="account-nav-hello">Hello</p>
        <p className="account-nav-name">{customer?.name || 'Customer'}</p>
      </div>
      <nav className="account-nav-links">
        <NavLink to="/profile" className={({ isActive }) => `account-nav-link ${isActive ? 'active' : ''}`}>
          <User size={16} />
          Profile
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `account-nav-link ${isActive ? 'active' : ''}`}>
          <Package size={16} />
          Orders
        </NavLink>
        <NavLink to="/wishlist" className={({ isActive }) => `account-nav-link ${isActive ? 'active' : ''}`}>
          <Heart size={16} />
          Wishlist
          {wishlistCount > 0 && <span className="account-nav-count">{wishlistCount}</span>}
        </NavLink>
        <NavLink to="/cart" className={({ isActive }) => `account-nav-link ${isActive ? 'active' : ''}`}>
          <ShoppingBag size={16} />
          Cart
          {itemCount > 0 && <span className="account-nav-count">{itemCount}</span>}
        </NavLink>
      </nav>
      <button type="button" className="account-nav-logout" onClick={logout}>
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
}
