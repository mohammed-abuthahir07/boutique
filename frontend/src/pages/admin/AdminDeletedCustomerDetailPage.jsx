import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Mail,
  Package,
  Phone,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
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

export default function AdminDeletedCustomerDetailPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [customer, setCustomer] = useState(null);
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteInFlightRef = useRef(false);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);
      setNotFound(false);
      const res = await adminService.getDeletedCustomerDetails(customerId);
      if (res.success) {
        setCustomer(res.customer);
        setSummary(res.summary);
        setOrders(res.orders || []);
      } else {
        setPageError(res.message || 'Failed to load archived customer details.');
      }
    } catch (err) {
      if (err.status === 404) {
        setNotFound(true);
        setCustomer(null);
      } else {
        setPageError(err.message || 'Failed to load archived customer details.');
      }
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const openOrder = async (orderId) => {
    setOrderModalOpen(true);
    setOrderLoading(true);
    setOrderError(null);
    setOrderDetail(null);
    setOrderItems([]);

    try {
      const res = await adminService.getDeletedCustomerOrderDetails(customerId, orderId);
      if (res.success) {
        setOrderDetail(res.order);
        setOrderItems(res.items || []);
      } else {
        setOrderError(res.message || 'Unable to load archived order.');
      }
    } catch (err) {
      setOrderError(err.message || 'Unable to load archived order.');
    } finally {
      setOrderLoading(false);
    }
  };

  const closeConfirm = () => {
    if (deleting) return;
    setConfirmOpen(false);
  };

  const handlePermanentDelete = async () => {
    if (deleteInFlightRef.current || deleting) return;
    deleteInFlightRef.current = true;
    setDeleting(true);

    try {
      const res = await adminService.deleteDeletedCustomer(customerId);
      if (!res.success) {
        error(res.message || 'Unable to permanently delete this archived customer. Please try again.');
        return;
      }
      success(res.message || 'Archived customer deleted permanently.');
      navigate('/admin/deleted-customers', { replace: true });
    } catch (err) {
      error(err.message || 'Unable to permanently delete this archived customer. Please try again.');
    } finally {
      deleteInFlightRef.current = false;
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading archived customer details..." fullScreen={false} />;
  }

  if (notFound) {
    return (
      <div className="admin-customers-page">
        <div className="admin-customers-alert error">
          <AlertCircle size={18} />
          <span>Archived customer not found.</span>
        </div>
        <Link to="/admin/deleted-customers" className="btn btn-outline">
          <ArrowLeft size={16} />
          Back to Deleted Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-customers-page">
      <div className="admin-page-header deleted-detail-header">
        <div>
          <Link to="/admin/deleted-customers" className="deleted-back-link">
            <ArrowLeft size={16} />
            Deleted Customers
          </Link>
          <h1 className="admin-page-title">Deleted Customer Details</h1>
          <p className="admin-page-subtitle">
            Archived customer information and order history.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 size={16} />
          Delete Permanently
        </button>
      </div>

      {pageError && (
        <div className="admin-customers-alert error">
          <AlertCircle size={18} />
          <span>{pageError}</span>
        </div>
      )}

      {customer && (
        <>
          <div className="admin-card deleted-info-card">
            <div className="client-dossier-header">
              <div className="dossier-avatar">
                {customer.customer_name ? customer.customer_name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="dossier-info">
                <div className="dossier-name-row">
                  <h2 className="dossier-name">{customer.customer_name}</h2>
                  <span className="badge badge-danger">DELETED</span>
                </div>
                <p className="deleted-archive-label">Archived Customer Information</p>
                <div className="dossier-meta">
                  <span>Customer ID #{customer.original_customer_id}</span>
                  <span>
                    <Mail size={14} /> {customer.customer_email}
                  </span>
                  {customer.customer_phone && (
                    <span>
                      <Phone size={14} /> {customer.customer_phone}
                    </span>
                  )}
                  <span>
                    <Calendar size={14} /> Deleted {formatDate(customer.deleted_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="dossier-summary-grid">
            <div className="dossier-stat-card">
              <div className="dossier-stat-label">
                <ShoppingBag size={14} /> Total Orders
              </div>
              <div className="dossier-stat-val">{summary?.total_orders ?? 0}</div>
            </div>
            <div className="dossier-stat-card">
              <div className="dossier-stat-label">
                <Package size={14} /> Total Products Bought
              </div>
              <div className="dossier-stat-val">{summary?.total_products_bought ?? 0}</div>
            </div>
            <div className="dossier-stat-card">
              <div className="dossier-stat-label">
                <DollarSign size={14} /> Total Spent
              </div>
              <div className="dossier-stat-val">{formatPrice(summary?.total_spent)}</div>
            </div>
            <div className="dossier-stat-card">
              <div className="dossier-stat-label">
                <Clock size={14} /> Last Order
              </div>
              <div className="dossier-stat-val-sm">{formatDate(summary?.last_order_date)}</div>
            </div>
          </div>

          <div className="admin-card table-card">
            <h3 className="dossier-section-title deleted-section-title">Archived Order History</h3>
            {orders.length === 0 ? (
              <div className="dossier-empty-orders">
                <ShoppingBag size={32} className="empty-icon" />
                <p className="empty-title">No archived orders</p>
                <p className="empty-sub">This customer has no archived order history.</p>
              </div>
            ) : (
              <div className="admin-table-container deleted-customers-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Order Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment Method</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="cust-id">{ord.order_number || `#${ord.original_order_id}`}</td>
                        <td className="cust-date">{formatDate(ord.created_at)}</td>
                        <td>{ord.item_count}</td>
                        <td className="cust-spent">{formatPrice(ord.total_amount)}</td>
                        <td>
                          <span className={`badge ${ord.payment_method === 'RAZORPAY' ? 'badge-gold' : 'badge-neutral'}`}>
                            {ord.payment_method || 'DIRECT'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${(ord.payment_status || 'PENDING').toLowerCase()}`}>
                            {ord.payment_status || 'PENDING'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${ord.order_status?.toLowerCase() || 'pending'}`}>
                            {ord.order_status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-cust-view"
                            onClick={() => openOrder(ord.id)}
                          >
                            <Eye size={16} />
                            <span>View Order</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title="Archived Order Details"
        maxWidth="760px"
      >
        {orderLoading ? (
          <Loader message="Loading archived order..." fullScreen={false} />
        ) : orderError ? (
          <div className="admin-customers-alert error">
            <AlertCircle size={18} />
            <span>{orderError}</span>
          </div>
        ) : orderDetail ? (
          <div className="archived-order-detail">
            <div className="archived-order-grid">
              <div>
                <span className="archived-field-label">Order ID</span>
                <p>{orderDetail.order_number || `#${orderDetail.original_order_id}`}</p>
              </div>
              <div>
                <span className="archived-field-label">Original Customer ID</span>
                <p>#{orderDetail.original_customer_id}</p>
              </div>
              <div>
                <span className="archived-field-label">Customer Name</span>
                <p>{orderDetail.customer_name}</p>
              </div>
              <div>
                <span className="archived-field-label">Customer Email</span>
                <p>{orderDetail.customer_email}</p>
              </div>
              <div>
                <span className="archived-field-label">Customer Phone</span>
                <p>{orderDetail.customer_phone || '—'}</p>
              </div>
              <div>
                <span className="archived-field-label">Order Date</span>
                <p>{formatDate(orderDetail.created_at)}</p>
              </div>
              <div>
                <span className="archived-field-label">Order Status</span>
                <p>{orderDetail.order_status}</p>
              </div>
              <div>
                <span className="archived-field-label">Payment Method</span>
                <p>{orderDetail.payment_method || 'DIRECT'}</p>
              </div>
              <div>
                <span className="archived-field-label">Payment Status</span>
                <p>{orderDetail.payment_status || 'PENDING'}</p>
              </div>
              <div>
                <span className="archived-field-label">Total Amount</span>
                <p>{formatPrice(orderDetail.total_amount)}</p>
              </div>
              {orderDetail.razorpay_order_id && (
                <div>
                  <span className="archived-field-label">Razorpay Order ID</span>
                  <p className="cust-id">{orderDetail.razorpay_order_id}</p>
                </div>
              )}
              {orderDetail.razorpay_payment_id && (
                <div>
                  <span className="archived-field-label">Razorpay Payment ID</span>
                  <p className="cust-id">{orderDetail.razorpay_payment_id}</p>
                </div>
              )}
              {orderDetail.razorpay_signature && (
                <div className="archived-field-wide">
                  <span className="archived-field-label">Razorpay Signature</span>
                  <p className="archived-signature">{orderDetail.razorpay_signature}</p>
                </div>
              )}
              <div className="archived-field-wide">
                <span className="archived-field-label">Shipping Address</span>
                <p>{orderDetail.shipping_address}</p>
              </div>
            </div>

            <h4 className="dossier-section-title">Order Items</h4>
            <div className="deleted-customers-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Product ID</th>
                    <th>Variant ID</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.product_id ?? '—'}</td>
                      <td>{item.variant_id ?? '—'}</td>
                      <td>{item.variant_color || '—'}</td>
                      <td>{item.variant_size || '—'}</td>
                      <td>{formatPrice(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={confirmOpen}
        onClose={closeConfirm}
        title="Delete Archived Customer?"
        maxWidth="480px"
      >
        <p className="profile-delete-copy">
          This will permanently delete this customer&apos;s archived information and order history. This action cannot be undone.
        </p>
        <div className="profile-delete-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={closeConfirm}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handlePermanentDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
