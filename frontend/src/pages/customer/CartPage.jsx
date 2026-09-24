import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/customer/CartItem';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './CartPage.css';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const hasItems = cart.items && cart.items.length > 0;

  return (
    <div className="cart-page">
      <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />

      <div className="container cart-page-container">
        <div className="cart-page-header">
          <h1 className="cart-page-title">Your Shopping Bag</h1>
          {hasItems && (
            <span className="cart-count-note">
              {cart.total_quantity} item{cart.total_quantity > 1 ? 's' : ''} curated
            </span>
          )}
        </div>

        {loading ? (
          <Loader message="Reviewing your bespoke shopping bag..." />
        ) : !hasItems ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            description="Explore our atelier's newest collections to add exquisite pret-a-porter and couture silhouettes."
            actionText="Start Shopping"
            actionLink="/shop"
          />
        ) : (
          <div className="cart-content-grid">
            {/* Left: Cart Items List */}
            <div className="cart-items-column">
              <div className="cart-items-card">
                <div className="cart-table-head">
                  <span>Product & Specification</span>
                  <span>Price / Qty / Subtotal</span>
                </div>
                <div className="cart-items-list">
                  {cart.items.map((item) => (
                    <CartItem
                      key={item.cart_item_id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </div>

              {/* Delivery Assurance */}
              <div className="cart-assurance-banner">
                <div className="assurance-col">
                  <Truck size={20} className="assurance-icon" />
                  <div>
                    <h5>Complimentary Insured Courier</h5>
                    <p>Tracked delivery direct from atelier</p>
                  </div>
                </div>
                <div className="assurance-col">
                  <ShieldCheck size={20} className="assurance-icon" />
                  <div>
                    <h5>Authenticity Assured</h5>
                    <p>Certified artisanal textiles & handcraft</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="cart-summary-column">
              <div className="order-summary-card">
                <h3 className="summary-title">Order Summary</h3>
                <div className="summary-gold-line"></div>

                <div className="summary-line">
                  <span className="summary-label">Bag 
                    
                  </span>
                  <span className="summary-val">{formatPrice(cart.subtotal)}</span>
                </div>

                <div className="summary-line">
                  <span className="summary-label">Estimated Shipping</span>
                  <span className="summary-val free-shipping">Complimentary</span>
                </div>

                <div className="summary-line">
                  <span className="summary-label">Atelier Packaging</span>
                  <span className="summary-val free-shipping">Complimentary</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-total-line">
                  <span className="total-label">Total Amount</span>
                  <span className="total-amount">{formatPrice(cart.total)}</span>
                </div>
                <p className="summary-tax-note">Inclusive of GST and all applicable textile taxes.</p>

                <button
                  type="button"
                  className="btn btn-primary btn-lg checkout-btn"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>

                <Link to="/shop" className="continue-shopping-link">
                  Continue Exploring Collections
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
