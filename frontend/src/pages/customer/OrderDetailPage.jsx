import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, User, Calendar, ShieldCheck } from 'lucide-react';
import customerService from '../../services/customerService';
import Loader from '../../components/common/Loader';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './OrderDetailPage.css';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);
        const res = await customerService.getOrderById(id);
        if (isMounted) {
          if (res.success && res.order) {
            setOrder(res.order);
          } else {
            setError(res.message || 'Order details not found');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch order details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loader fullScreen message="Accessing secure order archives..." />;
  }

  if (error || !order) {
    return (
      <div className="container order-detail-error">
        <Package size={48} className="text-muted" />
        <h2>Order Archive Unavailable</h2>
        <p>{error || 'The requested order record could not be retrieved.'}</p>
        <Link to="/orders" className="btn btn-accent btn-sm">
          Return to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <Breadcrumbs
        items={[
          { label: 'My Orders', link: '/orders' },
          { label: order.order_id },
        ]}
      />

      <div className="container order-detail-container">
        {/* Header */}
        <div className="order-detail-header">
          <Link to="/orders" className="back-link">
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
          <div className="order-header-row">
            <div>
              <span className="order-ref-eyebrow">Official Commission</span>
              <h1 className="order-main-id">{order.order_id}</h1>
              <span className="order-placed-date">
                Placed on {formatDate(order.created_at)}
              </span>
            </div>
            <div className="order-header-status">
              <span className={`badge badge-${order.order_status?.toLowerCase() || 'pending'}`}>
                {order.order_status || 'PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* Two-column Layout */}
        <div className="order-detail-grid">
          {/* Left: Items Table */}
          <div className="order-items-col card">
            <h3 className="section-title-sm">Commissioned Pieces</h3>
            <div className="gold-divider"></div>

            <div className="items-table-wrapper">
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Garment</th>
                    <th>Color & Fit</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items &&
                    order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="product-name-cell">
                          <Link to={`/product/${item.product_id}`} className="item-link">
                            {item.product_name}
                          </Link>
                        </td>
                        <td>
                          <span className="variant-tag">
                            {item.variant_color} &bull; {item.variant_size}
                          </span>
                        </td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td className="text-right font-bold">{formatPrice(item.subtotal)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="order-totals-summary">
              <div className="tot-line">
                <span>Insured Express Delivery</span>
                <span className="text-success font-medium">Complimentary</span>
              </div>
              <div className="tot-line">
                <span>Atelier Signature Packaging</span>
                <span className="text-success font-medium">Complimentary</span>
              </div>
              <div className="tot-line grand-tot-line">
                <span>Grand Total</span>
                <span className="order-grand-tot">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Right: Client & Delivery Info */}
          <div className="order-sidebar-col">
            <div className="card client-info-card">
              <h3 className="section-title-sm">Client Information</h3>
              <div className="gold-divider"></div>

              <div className="sidebar-info-group">
                <div className="group-label">
                  <User size={15} /> Recipient
                </div>
                <p className="group-val">{order.customer_name}</p>
                <p className="group-subval">{order.customer_email}</p>
                <p className="group-subval">{order.customer_phone}</p>
              </div>

              <div className="sidebar-info-group">
                <div className="group-label">
                  <MapPin size={15} /> Shipping Destination
                </div>
                <p className="group-val address-val">{order.shipping_address}</p>
              </div>

              <div className="sidebar-info-group">
                <div className="group-label">
                  <Package size={15} /> Atelier Courier Tracking
                </div>
                <p className="group-val status-val">
                  Status: <strong>{order.order_status}</strong>
                </p>
                <span className="tracking-hint">
                  Your courier will verify recipient identity upon delivery handover.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
