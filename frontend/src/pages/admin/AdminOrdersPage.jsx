import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Package } from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import './AdminOrdersPage.css';

const ORDER_STATUSES = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrdersPage() {
  const { error } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrders();
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filtered = orders.filter((ord) => {
    const matchSearch =
      ord.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.customer_phone && ord.customer_phone.includes(searchTerm)) ||
      (ord.customer_email && ord.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || ord.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="admin-orders-page">
      <div className="page-header-row">
        <div>
          <span className="section-subtitle">Dispatch & Fulfillment</span>
          <h1 className="admin-page-title">Client Orders Management</h1>
        </div>
      </div>

      <div className="card table-container-card">
        <div className="table-filter-bar">
          <div className="admin-search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Order ID, client name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="status-tabs-row">
            {ORDER_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                className={`status-tab-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Loader message="Loading atelier orders..." />
        ) : filtered.length === 0 ? (
          <div className="admin-empty-table">
            <p>No orders match the specified criteria.</p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Client Information</th>
                  <th>Order Total</th>
                  <th>Status</th>
                  <th>Placement Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <div className="order-ref-cell">
                        <Package size={16} className="text-gold" />
                        <Link to={`/admin/orders/${ord.id}`} className="order-ref-code">
                          {ord.order_id}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <div className="client-cell">
                        <span className="client-name">{ord.customer_name}</span>
                        <span className="client-contact">
                          {ord.customer_phone} &bull; {ord.customer_email}
                        </span>
                      </div>
                    </td>
                    <td className="font-semibold">{formatPrice(ord.total_amount)}</td>
                    <td>
                      <span className={`badge badge-${ord.order_status?.toLowerCase() || 'pending'}`}>
                        {ord.order_status}
                      </span>
                    </td>
                    <td className="text-muted">{formatDate(ord.created_at)}</td>
                    <td className="text-right">
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        className="btn btn-outline-gold btn-sm"
                        title="Manage Order & Update Dispatch Status"
                      >
                        <Eye size={14} /> Review Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
