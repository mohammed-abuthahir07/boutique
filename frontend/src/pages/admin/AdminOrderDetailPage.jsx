import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  MapPin,
  Save,
  Clock,
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import './AdminOrderDetailPage.css';

const ALLOWED_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { success, error } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrderById(id);
      if (res.success && res.order) {
        setOrder(res.order);
        setSelectedStatus(res.order.order_status);
      } else {
        error('Order record not found');
      }
    } catch (err) {
      error(err.message || 'Failed to retrieve order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    setUpdating(true);
    try {
      const res = await adminService.updateOrderStatus(id, selectedStatus);
      if (res.success) {
        success(res.message || 'Order status updated successfully');
        loadOrder();
      }
    } catch (err) {
      error(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

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
    return <Loader message="Accessing official order manifest..." />;
  }

  if (!order) {
    return (
      <div className="admin-order-detail-page">
        <p>Order not found.</p>
        <Link to="/admin/orders" className="btn btn-outline btn-sm">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-order-detail-page">
      <div className="order-detail-nav">
        <Link to="/admin/orders" className="back-link">
          <ArrowLeft size={16} /> Back to All Orders
        </Link>
      </div>

      <div className="order-summary-header card">
        <div className="header-info-side">
          <span className="order-eyebrow">Client Commission Manifest</span>
          <h1 className="admin-order-title">{order.order_id}</h1>
          <p className="order-placed-text">Placed on {formatDate(order.created_at)}</p>
        </div>

        {/* Status Modifier Box */}
        <div className="status-modifier-box">
          <span className="modifier-lbl">Update Atelier Status</span>
          <div className="modifier-controls">
            <select
              className="form-select status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {ALLOWED_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={updating || selectedStatus === order.order_status}
              onClick={handleStatusUpdate}
              className="btn btn-accent btn-sm"
            >
              <Save size={14} />
              {updating ? 'Updating...' : 'Save Status'}
            </button>
          </div>
          <span className="status-current-hint">
            Current: <strong className={`badge badge-${order.order_status?.toLowerCase()}`}>{order.order_status}</strong>
          </span>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="order-manifest-grid">
        {/* Left: Items List */}
        <div className="manifest-items-col card">
          <h3 className="section-title-sm">Commissioned Items ({order.items ? order.items.length : 0})</h3>
          <div className="gold-divider"></div>

          <div className="admin-table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items &&
                  order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/admin/products/${item.product_id}`} className="item-title-link">
                          {item.product_name}
                        </Link>
                        <span className="font-mono text-muted d-block font-xs">
                          Product ID #{item.product_id}
                        </span>
                      </td>
                      <td>{formatPrice(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td className="text-right font-semibold">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="admin-order-totals">
            <div className="tot-row">
              <span>Delivery Charges</span>
              <span className="text-success font-medium">Complimentary Insured Shipping</span>
            </div>
            <div className="tot-row grand-tot-row">
              <span>Total Amount</span>
              <span className="admin-grand-total">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Right: Client & Shipping Details */}
        <div className="manifest-client-col card">
          <h3 className="section-title-sm">Client & Dispatch Destination</h3>
          <div className="gold-divider"></div>

          <div className="client-data-section">
            <div className="client-data-block">
              <div className="block-title">
                <User size={15} /> Customer Details
              </div>
              <p className="block-val">{order.customer_name}</p>
              <p className="block-subval">{order.customer_email}</p>
              <p className="block-subval">{order.customer_phone}</p>
            </div>

            <div className="client-data-block">
              <div className="block-title">
                <MapPin size={15} /> Delivery Destination
              </div>
              <p className="block-val address-block">{order.shipping_address}</p>
            </div>

            <div className="client-data-block">
              <div className="block-title">
                <Clock size={15} /> Dispatch History
              </div>
              <p className="block-subval">Manifest created: {formatDate(order.created_at)}</p>
              <p className="block-subval">Last updated: {formatDate(order.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
