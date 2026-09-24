import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Eye,
  Phone,
  Search,
  UserX,
  X,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import './AdminCustomersPage.css';
import './AdminDeletedCustomersPage.css';

function formatPrice(val) {
  const num = Number(val);
  if (Number.isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminDeletedCustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDeletedCustomers(debouncedSearch);
      if (res.success) {
        setCustomers(res.customers || []);
      } else {
        setError(res.message || 'Failed to fetch deleted customers.');
        setCustomers([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load deleted customers.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  if (loading) {
    return <Loader message="Loading deleted customers..." fullScreen={false} />;
  }

  return (
    <div className="admin-customers-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Deleted Customers</h1>
          <p className="admin-page-subtitle">
            View archived customer accounts and their order history.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-customers-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

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
          {customers.length} {customers.length === 1 ? 'Archived Client' : 'Archived Clients'}
        </div>
      </div>

      <div className="admin-card table-card">
        {!error && customers.length === 0 ? (
          <EmptyState
            title="No Deleted Customers"
            description={
              searchQuery
                ? `No archived clients match "${searchQuery}". Try a different search keyword.`
                : 'Deleted customer accounts will appear here after customers delete their accounts.'
            }
            icon={UserX}
            actionText=""
          />
        ) : !error ? (
          <div className="admin-table-container deleted-customers-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Last Order</th>
                  <th>Deleted On</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => (
                  <tr key={cust.original_customer_id}>
                    <td>
                      <div className="cust-user-cell">
                        <div className="cust-avatar">
                          {cust.customer_name ? cust.customer_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <span className="cust-name">{cust.customer_name || 'Unnamed Client'}</span>
                          <span className="cust-email">{cust.customer_email}</span>
                          <span className="cust-id">ID #{cust.original_customer_id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cust-contact-cell">
                        {cust.customer_phone ? (
                          <span className="cust-contact-item">
                            <Phone size={13} />
                            {cust.customer_phone}
                          </span>
                        ) : (
                          <span className="cust-no-phone">No phone recorded</span>
                        )}
                      </div>
                    </td>
                    <td>{cust.total_orders}</td>
                    <td className="cust-spent">{formatPrice(cust.total_spent)}</td>
                    <td className="cust-date">{formatDate(cust.last_order_date)}</td>
                    <td className="cust-date">{formatDate(cust.deleted_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-cust-view"
                        onClick={() => navigate(`/admin/deleted-customers/${cust.original_customer_id}`)}
                      >
                        <Eye size={16} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
