import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  Package,
  Eye,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import './AdminCustomersPage.css';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected customer for modal view
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getCustomers();
      if (res.success) {
        setCustomers(res.customers || []);
      } else {
        setError(res.message || 'Failed to fetch customer directory.');
      }
    } catch (err) {
      setError(err.message || 'Network error fetching customer directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  async function openCustomerModal(id) {
    setSelectedCustomerId(id);
    setDetailLoading(true);
    setDetailError(null);
    setCustomerDetail(null);
    setCustomerOrders([]);

    try {
      const [detailRes, ordersRes] = await Promise.allSettled([
        adminService.getCustomerById(id),
        adminService.getCustomerOrders(id),
      ]);

      if (detailRes.status === 'fulfilled' && detailRes.value.success) {
        setCustomerDetail(detailRes.value.customer);
      } else {
        setDetailError('Unable to load customer profile details.');
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value.success) {
        setCustomerOrders(ordersRes.value.orders || []);
      }
    } catch (err) {
      setDetailError(err.message || 'Failed to fetch customer details.');
    } finally {
      setDetailLoading(false);
    }
  }

  function closeCustomerModal() {
    setSelectedCustomerId(null);
    setCustomerDetail(null);
    setCustomerOrders([]);
  }

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        c.id?.toString().includes(q)
    );
  }, [customers, searchQuery]);

  if (loading) {
    return <Loader text="Loading boutique customer directory..." fullScreen={false} />;
  }

  return (
    <div className="admin-customers-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer Directory</h1>
          <p className="admin-page-subtitle">
            View registered clientele, purchase statistics, contact info, and activity.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-customers-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="admin-card customers-toolbar">
        <div className="customer-search-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or customer ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="customer-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="customers-count-tag">
          {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Client' : 'Clients'}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="admin-card table-card">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            title="No customers found"
            message={
              searchQuery
                ? `No clients match "${searchQuery}". Try a different search keyword.`
                : 'No clients have registered with the boutique yet.'
            }
            icon={Users}
          />
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust) => {
                  const createdDate = cust.created_at
                    ? new Date(cust.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={cust.id}>
                      <td className="cust-id">#{cust.id}</td>
                      <td>
                        <div className="cust-user-cell">
                          <div className="cust-avatar">
                            {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <span className="cust-name">{cust.name || 'Unnamed Client'}</span>
                            <span className="cust-email">{cust.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="cust-contact-cell">
                          {cust.phone ? (
                            <span className="cust-contact-item">
                              <Phone size={13} />
                              {cust.phone}
                            </span>
                          ) : (
                            <span className="cust-no-phone">No phone recorded</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${cust.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                          {cust.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="cust-date">{createdDate}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-cust-view"
                          onClick={() => openCustomerModal(cust.id)}
                          title="View Profile & Purchases"
                        >
                          <Eye size={16} />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomerId && (
        <Modal
          isOpen={true}
          onClose={closeCustomerModal}
          title="Client Dossier"
          size="large"
        >
          {detailLoading ? (
            <Loader text="Loading client profile..." fullScreen={false} />
          ) : detailError ? (
            <div className="admin-customers-alert error">
              <AlertCircle size={18} />
              <span>{detailError}</span>
            </div>
          ) : customerDetail ? (
            <div className="customer-modal-content">
              {/* Header profile info */}
              <div className="client-dossier-header">
                <div className="dossier-avatar">
                  {customerDetail.name ? customerDetail.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="dossier-info">
                  <div className="dossier-name-row">
                    <h2 className="dossier-name">{customerDetail.name}</h2>
                    <span className={`badge ${customerDetail.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                      {customerDetail.status || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="dossier-meta">
                    <span>
                      <Mail size={14} /> {customerDetail.email}
                    </span>
                    {customerDetail.phone && (
                      <span>
                        <Phone size={14} /> {customerDetail.phone}
                      </span>
                    )}
                    <span>
                      <Calendar size={14} /> Registered{' '}
                      {customerDetail.created_at
                        ? new Date(customerDetail.created_at).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase Summary Metrics */}
              <div className="dossier-summary-grid">
                <div className="dossier-stat-card">
                  <div className="dossier-stat-label">
                    <ShoppingBag size={14} /> Total Orders
                  </div>
                  <div className="dossier-stat-val">
                    {customerDetail.purchase_summary?.total_orders ?? 0}
                  </div>
                </div>

                <div className="dossier-stat-card">
                  <div className="dossier-stat-label">
                    <Package size={14} /> Items Purchased
                  </div>
                  <div className="dossier-stat-val">
                    {customerDetail.purchase_summary?.total_products_bought ?? 0}
                  </div>
                </div>

                <div className="dossier-stat-card">
                  <div className="dossier-stat-label">
                    <DollarSign size={14} /> Lifetime Spend
                  </div>
                  <div className="dossier-stat-val">
                    ${parseFloat(customerDetail.purchase_summary?.total_spent || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div className="dossier-stat-card">
                  <div className="dossier-stat-label">
                    <Clock size={14} /> Last Order
                  </div>
                  <div className="dossier-stat-val-sm">
                    {customerDetail.purchase_summary?.last_order_date
                      ? new Date(customerDetail.purchase_summary.last_order_date).toLocaleDateString()
                      : 'None yet'}
                  </div>
                </div>
              </div>

              {/* Order History Section */}
              <div className="dossier-orders-section">
                <h3 className="dossier-section-title">Order History</h3>
                {customerOrders.length === 0 ? (
                  <div className="dossier-empty-orders">
                    <ShoppingBag size={32} className="empty-icon" />
                    <p className="empty-title">No orders recorded</p>
                    <p className="empty-sub">
                      Client purchases will appear here once orders are placed.
                    </p>
                  </div>
                ) : (
                  <div className="dossier-orders-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerOrders.map((ord) => (
                          <tr key={ord.id}>
                            <td className="cust-id">#{ord.id}</td>
                            <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge badge-${ord.order_status?.toLowerCase()}`}>
                                {ord.order_status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>
                              ${parseFloat(ord.total_amount || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
}
