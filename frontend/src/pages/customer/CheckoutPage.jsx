import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, Lock, ArrowLeft } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import customerService from '../../services/customerService';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Loader from '../../components/common/Loader';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { customer } = useCustomerAuth();
  const { cart, clearCartState } = useCart();
  const { error, success } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shipping_address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Auto-populate from logged-in customer profile
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
      }));
    }
  }, [customer]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart.items || cart.items.length === 0) {
      // Allow brief moment for cart context initialization
      const timer = setTimeout(() => {
        if (!cart.items || cart.items.length === 0) {
          navigate('/cart');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cart.items, navigate]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required for courier updates';
    }

    if (!formData.shipping_address.trim() || formData.shipping_address.trim().length < 5) {
      errs.shipping_address = 'Shipping address must be at least 5 characters';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      error('Please complete all delivery fields with valid details');
      return;
    }

    setSubmitting(true);
    try {
      const res = await customerService.createOrder({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        shipping_address: formData.shipping_address.trim(),
      });

      if (res.success && res.order) {
        success(res.message || 'Order placed successfully');
        clearCartState();
        navigate('/order-success', { state: { order: res.order } });
      } else {
        error(res.message || 'Failed to place order');
      }
    } catch (err) {
      error(err.message || 'An error occurred while placing your order.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="checkout-page">
      <Breadcrumbs
        items={[
          { label: 'Shopping Bag', link: '/cart' },
          { label: 'Secure Checkout' },
        ]}
      />

      <div className="container checkout-container">
        <div className="checkout-header">
          <Link to="/cart" className="back-to-cart-link">
            <ArrowLeft size={16} /> Return to Shopping Bag
          </Link>
          <h1 className="checkout-title">Client Delivery & Atelier Order</h1>
          <p className="checkout-subtitle">
            Please provide your bespoke shipping destination. Your garments will be carefully pressed, wrapped, and insured.
          </p>
        </div>

        <div className="checkout-grid">
          {/* Form Column */}
          <div className="checkout-form-col">
            <form onSubmit={handleSubmit} className="card checkout-card" noValidate>
              <h3 className="card-section-title">Shipping & Client Information</h3>
              <div className="gold-divider"></div>

              {/* Name */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Recipient Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maharani Gayatri Devi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {formErrors.name && <p className="form-error">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address for Invoices & Tracking *
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {formErrors.email && <p className="form-error">{formErrors.email}</p>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Mobile Number for Courier Dispatch *
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {formErrors.phone && <p className="form-error">{formErrors.phone}</p>}
              </div>

              {/* Shipping Address */}
              <div className="form-group">
                <label htmlFor="shipping_address" className="form-label">
                  Complete Shipping Address *
                </label>
                <textarea
                  id="shipping_address"
                  className="form-textarea"
                  placeholder="Apartment/Suite, Street Address, Landmark, City, State, Postal Code"
                  rows={4}
                  value={formData.shipping_address}
                  onChange={(e) =>
                    setFormData({ ...formData, shipping_address: e.target.value })
                  }
                />
                {formErrors.shipping_address && (
                  <p className="form-error">{formErrors.shipping_address}</p>
                )}
                <span className="form-hint">
                  Minimum 5 characters. Include building name, street, and pincode.
                </span>
              </div>

              <div className="payment-notice-box">
                <div className="notice-icon-wrap">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h4 className="notice-title">Complimentary Atelier Dispatch</h4>
                  <p className="notice-text">
                    Orders are processed under official Maison atelier standards. Payment verification is completed during delivery handover or via concierge link.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg place-order-btn"
              >
                <Lock size={16} />
                {submitting ? 'Confirming Order with Atelier...' : 'Place Official Order'}
              </button>
            </form>
          </div>

          {/* Order Review Column */}
          <div className="checkout-review-col">
            <div className="card review-card">
              <h3 className="card-section-title">Bag Overview ({cart.item_count || 0})</h3>
              <div className="gold-divider"></div>

              <div className="review-items-list">
                {cart.items &&
                  cart.items.map((it) => (
                    <div key={it.cart_item_id} className="review-item">
                      <div className="review-item-main">
                        <h4 className="review-item-title">{it.product_name}</h4>
                        <span className="review-item-spec">
                          {it.color} / {it.size} &bull; Qty: {it.quantity}
                        </span>
                      </div>
                      <span className="review-item-price">{formatPrice(it.subtotal)}</span>
                    </div>
                  ))}
              </div>

              <div className="review-totals">
                <div className="review-line">
                  <span>Bag Subtotal</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="review-line">
                  <span>Insured Express Shipping</span>
                  <span className="free-text">Complimentary</span>
                </div>
                <div className="review-line total-line">
                  <span>Grand Total</span>
                  <span className="grand-total">{formatPrice(cart.total)}</span>
                </div>
              </div>

              <div className="review-footer">
                <div className="footer-point">
                  <Truck size={14} /> Express delivery in 2-4 business days
                </div>
                <div className="footer-point">
                  <Lock size={14} /> Authenticated client SSL transaction
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
