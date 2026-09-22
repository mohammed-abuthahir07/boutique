import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, Calendar } from 'lucide-react';
import customerService from '../../services/customerService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './MyOrdersPage.css';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);
        const res = await customerService.getMyOrders();
        if (isMounted) {
          if (res.success && Array.isArray(res.orders)) {
            setOrders(res.orders);
          } else {
            setOrders([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to retrieve your orders');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="orders-page">
      <Breadcrumbs items={[{ label: 'Client Account', link: '/profile' }, { label: 'My Orders' }]} />

      <div className="container orders-container">
        <div className="orders-header">
          <span className="section-subtitle">Atelier Acquisitions</span>
          <h1 className="orders-title">Your Order History</h1>
          <p className="orders-subtitle">
            Review status updates, courier tracking references, and invoices for all your bespoke commissions.
          </p>
        </div>

        {loading ? (
          <Loader message="Fetching order archives..." />
        ) : error ? (
          <div className="orders-error card">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="btn btn-outline btn-sm">
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders placed yet"
            description="You have not commissioned any garments yet. Explore our curated collections to place your first atelier order."
            actionText="Browse Collection"
            actionLink="/shop"
          />
        ) : (
          <div className="orders-list">
            {orders.map((ord) => (
              <div key={ord.id} className="order-history-card card">
                <div className="order-card-header">
                  <div className="order-id-group">
                    <span className="order-id-label">Order Reference</span>
                    <h3 className="order-id-text">{ord.order_id}</h3>
                  </div>

                  <div className="order-status-group">
                    <span className={`badge badge-${ord.order_status?.toLowerCase() || 'pending'}`}>
                      {ord.order_status || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-data-point">
                    <Calendar size={15} className="order-data-icon" />
                    <div>
                      <span className="data-lbl">Date Placed</span>
                      <span className="data-val">{formatDate(ord.created_at)}</span>
                    </div>
                  </div>

                  <div className="order-data-point">
                    <Clock size={15} className="order-data-icon" />
                    <div>
                      <span className="data-lbl">Recipient</span>
                      <span className="data-val">{ord.customer_name}</span>
                    </div>
                  </div>

                  <div className="order-data-point">
                    <div>
                      <span className="data-lbl">Grand Total</span>
                      <span className="data-val order-total-highlight">
                        {formatPrice(ord.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-cta">
                    <Link to={`/orders/${ord.id}`} className="btn btn-outline-gold btn-sm">
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
