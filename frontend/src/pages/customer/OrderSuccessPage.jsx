import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Package, Home, MapPin, User } from 'lucide-react';
import './OrderSuccessPage.css';

export default function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="order-success-page">
      <div className="container order-success-container">
        {/* Success Banner */}
        <div className="success-header-card card">
          <div className="success-icon-wrap">
            <CheckCircle size={48} className="success-icon" />
          </div>
          <span className="order-confirmed-tag">Order Confirmed by Atelier</span>
          <h1 className="success-title">Thank You For Your Patronage</h1>
          <p className="success-subtitle">
            Your haute couture order has been successfully recorded. Our atelier artisans are preparing your garments with utmost dedication.
          </p>

          <div className="order-id-pill">
            <span>Reference ID:</span>
            <strong>{order.order_id}</strong>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="order-details-grid">
          {/* Ordered Products Table */}
          <div className="card success-products-card">
            <h3 className="section-heading">Curated Garments</h3>
            <div className="gold-divider"></div>

            <div className="items-table-wrap">
              <table className="success-table">
                <thead>
                  <tr>
                    <th>Creation</th>
                    <th>Color / Fit</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items &&
                    order.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="item-name-cell">
                          <strong>{it.product_name}</strong>
                        </td>
                        <td>
                          <span className="variant-badge">
                            {it.color} / {it.size}
                          </span>
                        </td>
                        <td>{formatPrice(it.price)}</td>
                        <td>{it.quantity}</td>
                        <td className="text-right font-semibold">{formatPrice(it.subtotal)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="success-totals-box">
              <div className="success-total-row">
                <span>Insured Express Shipping</span>
                <span className="text-success font-semibold">Complimentary</span>
              </div>
              <div className="success-total-row grand-total-row">
                <span>Total Amount Paid / Payable</span>
                <span className="success-grand-total">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Status Summary */}
          <div className="card success-info-card">
            <h3 className="section-heading">Delivery & Client Summary</h3>
            <div className="gold-divider"></div>

            <div className="info-block">
              <div className="info-label">
                <User size={16} /> Recipient
              </div>
              <p className="info-val">{order.customer?.name || order.customer_name}</p>
              <p className="info-subval">{order.customer?.email || order.customer_email}</p>
              <p className="info-subval">{order.customer?.phone || order.customer_phone}</p>
            </div>

            <div className="info-block">
              <div className="info-label">
                <MapPin size={16} /> Shipping Destination
              </div>
              <p className="info-val address-text">{order.shipping_address}</p>
            </div>

            <div className="info-block">
              <div className="info-label">
                <Package size={16} /> Atelier Status
              </div>
              <span className={`badge badge-${order.order_status?.toLowerCase() || 'pending'}`}>
                {order.order_status || 'PENDING'}
              </span>
            </div>

            <div className="success-actions-wrap">
              <Link to={`/orders/${order.id}`} className="btn btn-primary w-full">
                <Package size={16} /> View Order Details
              </Link>
              <Link to="/shop" className="btn btn-outline w-full">
                <Home size={16} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
