import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import './AdminDashboardPage.css';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        const [
          sumRes,
          ordersRes,
          prodRes,
          lowRes,
          monthlyRes,
          yearlyRes,
          actRes,
        ] = await Promise.allSettled([
          adminService.getDashboardSummary(),
          adminService.getDashboardRecentOrders(),
          adminService.getDashboardRecentProducts(),
          adminService.getDashboardLowStock(),
          adminService.getDashboardMonthlyRevenue(),
          adminService.getDashboardYearlyRevenue(),
          adminService.getDashboardRecentActivity(),
        ]);

        if (isMounted) {
          if (sumRes.status === 'fulfilled' && sumRes.value.success) {
            setSummary(sumRes.value.summary);
          }
          if (ordersRes.status === 'fulfilled' && ordersRes.value.success) {
            setRecentOrders(ordersRes.value.recent_orders || []);
          }
          if (prodRes.status === 'fulfilled' && prodRes.value.success) {
            setRecentProducts(prodRes.value.recent_products || []);
          }
          if (lowRes.status === 'fulfilled' && lowRes.value.success) {
            setLowStockProducts(lowRes.value.low_stock_products || []);
          }
          if (monthlyRes.status === 'fulfilled' && monthlyRes.value.success) {
            setMonthlyRevenue(monthlyRes.value.monthly_revenue || []);
          }
          if (yearlyRes.status === 'fulfilled' && yearlyRes.value.success) {
            setYearlyRevenue(yearlyRes.value.yearly_revenue || []);
          }
          if (actRes.status === 'fulfilled' && actRes.value.success) {
            setRecentActivity(actRes.value.recent_activity || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard metrics');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const maxMonthlyRevenue = Math.max(
    ...monthlyRevenue.map((m) => Number(m.revenue) || 0),
    1
  );

  if (loading) {
    return <Loader message="Aggregating atelier performance metrics..." />;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-page-header">
        <div>
          <span className="section-subtitle">Real-time Metrics</span>
          <h1 className="admin-view-title">Atelier Executive Summary</h1>
        </div>
        <div className="header-actions">
          <Link to="/admin/products/new" className="btn btn-accent btn-sm">
            + New Creation
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-error-banner card">
          <p>{error}</p>
        </div>
      )}

      {/* Metric Cards Grid */}
      {summary && (
        <div className="stats-grid">
          {/* Revenue */}
          <div className="stat-card card">
            <div className="stat-icon-wrap gold">
              <DollarSign size={20} />
            </div>
            <div className="stat-body">
              <span className="stat-label">Total Revenue</span>
              <h3 className="stat-val">{formatPrice(summary.total_revenue)}</h3>
              <span className="stat-desc">Non-cancelled commissions</span>
            </div>
          </div>

          {/* Total Orders */}
          <div className="stat-card card">
            <div className="stat-icon-wrap primary">
              <Package size={20} />
            </div>
            <div className="stat-body">
              <span className="stat-label">Total Orders</span>
              <h3 className="stat-val">{summary.total_orders}</h3>
              <span className="stat-desc">{summary.pending_orders} pending dispatch</span>
            </div>
          </div>

          {/* Active Products */}
          <div className="stat-card card">
            <div className="stat-icon-wrap accent">
              <ShoppingBag size={20} />
            </div>
            <div className="stat-body">
              <span className="stat-label">Active Silhouettes</span>
              <h3 className="stat-val">{summary.active_products}</h3>
              <span className="stat-desc">In {summary.active_categories} categories</span>
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="stat-card card">
            <div className="stat-icon-wrap warning">
              <AlertTriangle size={20} />
            </div>
            <div className="stat-body">
              <span className="stat-label">Inventory Attention</span>
              <h3 className="stat-val text-warning">
                {Number(summary.low_stock_products) + Number(summary.out_of_stock_products)}
              </h3>
              <span className="stat-desc">
                {summary.low_stock_products} low / {summary.out_of_stock_products} depleted
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Revenue & Growth Panels */}
      <div className="dashboard-charts-grid">
        {/* Monthly Revenue Breakdown */}
        <div className="card dash-panel-card">
          <div className="panel-header">
            <h3 className="panel-title">
              <TrendingUp size={16} className="text-gold" /> Monthly Revenue Trend
            </h3>
          </div>
          <div className="gold-divider"></div>

          {monthlyRevenue.length === 0 ? (
            <p className="no-data-msg">No monthly revenue records available.</p>
          ) : (
            <div className="monthly-revenue-list">
              {monthlyRevenue.map((m, idx) => (
                <div key={idx} className="month-rev-item">
                  <span className="month-tag">{m.month}</span>
                  <div className="month-bar-wrap">
                    <div
                      className="month-bar"
                      style={{
                        width: `${Math.min(100, Math.max(8, (Number(m.revenue) / maxMonthlyRevenue) * 100))}%`,
                      }}
                    ></div>
                  </div>
                  <span className="month-amount">{formatPrice(m.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Yearly Overview & Status Quick view */}
        <div className="card dash-panel-card">
          <div className="panel-header">
            <h3 className="panel-title">
              <Boxes size={16} className="text-gold" /> Yearly Revenue & Status
            </h3>
          </div>
          <div className="gold-divider"></div>

          <div className="yearly-revenue-summary">
            {yearlyRevenue.map((y, idx) => (
              <div key={idx} className="year-metric-box">
                <span className="year-lbl">Fiscal Year {y.year}</span>
                <span className="year-val">{formatPrice(y.revenue)}</span>
              </div>
            ))}
          </div>

          <div className="order-status-pills-row">
            <div className="status-metric-pill">
              <Clock size={14} className="text-warning" />
              <span>Pending: {summary?.pending_orders || 0}</span>
            </div>
            <div className="status-metric-pill">
              <CheckCircle size={14} className="text-success" />
              <span>Completed: {summary?.completed_orders || 0}</span>
            </div>
            <div className="status-metric-pill">
              <Layers size={14} />
              <span>Active Categories: {summary?.active_categories || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Tables Grid */}
      <div className="dashboard-tables-grid">
        {/* Recent Orders */}
        <div className="card dash-table-card">
          <div className="panel-header">
            <h3 className="panel-title">Recent Client Orders</h3>
            <Link to="/admin/orders" className="panel-link">
              All Orders <ArrowRight size={14} />
            </Link>
          </div>
          <div className="gold-divider"></div>

          {recentOrders.length === 0 ? (
            <p className="no-data-msg">No client commissions recorded yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Ref</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 6).map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <Link to={`/admin/orders/${ord.id}`} className="admin-table-link">
                          {ord.order_id}
                        </Link>
                      </td>
                      <td>{ord.customer_name}</td>
                      <td className="font-semibold">{formatPrice(ord.total_amount)}</td>
                      <td>
                        <span className={`badge badge-${ord.order_status?.toLowerCase()}`}>
                          {ord.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Watchlist */}
        <div className="card dash-table-card">
          <div className="panel-header">
            <h3 className="panel-title">Low Stock Alert (≤ 5 units)</h3>
            <Link to="/admin/inventory" className="panel-link">
              Manage Inventory <ArrowRight size={14} />
            </Link>
          </div>
          <div className="gold-divider"></div>

          {lowStockProducts.length === 0 ? (
            <p className="no-data-msg">All atelier silhouettes have healthy stock levels.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th className="text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.slice(0, 6).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/admin/products/${item.id}`} className="admin-table-link dash-prod-name" title={item.name}>
                          {item.name}
                        </Link>
                      </td>
                      <td>{item.category_name}</td>
                      <td>{formatPrice(item.price)}</td>
                      <td className="text-right">
                        <span className="badge badge-danger">{item.stock} left</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-tables-grid">
        <div className="card dash-table-card">
          <div className="panel-header">
            <h3 className="panel-title">Recent products</h3>
            <Link to="/admin/products" className="panel-link">
              All products <ArrowRight size={14} />
            </Link>
          </div>
          <div className="gold-divider"></div>
          {recentProducts.length === 0 ? (
            <p className="no-data-msg">No products have been added yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.slice(0, 6).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/admin/products/${item.id}`} className="admin-table-link dash-prod-name" title={item.name}>
                          {item.name}
                        </Link>
                      </td>
                      <td>{item.category_name}</td>
                      <td>{formatPrice(item.price)}</td>
                      <td>{item.stock}</td>
                      <td>
                        <span className={`badge badge-${item.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card dash-table-card">
          <div className="panel-header">
            <h3 className="panel-title">Recent activity</h3>
            <Link to="/admin/orders" className="panel-link">
              All orders <ArrowRight size={14} />
            </Link>
          </div>
          <div className="gold-divider"></div>
          {recentActivity.length === 0 ? (
            <p className="no-data-msg">No recent order activity.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.slice(0, 6).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/admin/orders/${item.id}`} className="admin-table-link">
                          {item.order_id}
                        </Link>
                      </td>
                      <td>{item.customer_name}</td>
                      <td>{formatPrice(item.total_amount)}</td>
                      <td>
                        <span className={`badge badge-${item.order_status?.toLowerCase()}`}>
                          {item.order_status}
                        </span>
                      </td>
                      <td className="text-muted">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
