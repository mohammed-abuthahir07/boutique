import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Layers,
  PieChart,
  BarChart3,
  Award,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../utils/format';
import './AdminAnalyticsPage.css';

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [orderStatus, setOrderStatus] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [monthlyOrders, setMonthlyOrders] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAnalytics() {
      try {
        setLoading(true);
        const [
          sumRes,
          statusRes,
          bestRes,
          mOrdersRes,
          mRevRes,
          catRes,
        ] = await Promise.allSettled([
          adminService.getAnalyticsSummary(),
          adminService.getAnalyticsOrderStatus(),
          adminService.getAnalyticsBestSelling(),
          adminService.getAnalyticsMonthlyOrders(),
          adminService.getAnalyticsMonthlyRevenue(),
          adminService.getAnalyticsCategorySales(),
        ]);

        if (isMounted) {
          if (sumRes.status === 'fulfilled' && sumRes.value.success) {
            setSummary(sumRes.value.summary);
          }
          if (statusRes.status === 'fulfilled' && statusRes.value.success) {
            setOrderStatus(statusRes.value.order_status || []);
          }
          if (bestRes.status === 'fulfilled' && bestRes.value.success) {
            setBestSelling(bestRes.value.best_selling_products || []);
          }
          if (mOrdersRes.status === 'fulfilled' && mOrdersRes.value.success) {
            setMonthlyOrders(mOrdersRes.value.monthly_orders || []);
          }
          if (mRevRes.status === 'fulfilled' && mRevRes.value.success) {
            setMonthlyRevenue(mRevRes.value.monthly_revenue || []);
          }
          if (catRes.status === 'fulfilled' && catRes.value.success) {
            setCategorySales(catRes.value.category_sales || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load analytics data.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <Loader text="Calculating boutique analytics..." fullScreen={false} />;
  }

  if (error) {
    return (
      <div className="admin-analytics-page">
        <div className="admin-analytics-alert error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Helpers for calculations
  const totalRevenue = summary ? parseFloat(summary.total_revenue || 0) : 0;
  const totalOrders = summary ? parseInt(summary.total_orders || 0, 10) : 0;
  const productsSold = summary ? parseInt(summary.products_sold || 0, 10) : 0;
  const pendingOrders = summary ? parseInt(summary.pending_orders || 0, 10) : 0;
  const completedOrders = summary ? parseInt(summary.completed_orders || 0, 10) : 0;

  // Max value calculation for bar visualizers
  const maxRevenue = monthlyRevenue.length > 0
    ? Math.max(...monthlyRevenue.map((r) => parseFloat(r.revenue || 0)), 1)
    : 1;

  const maxOrders = monthlyOrders.length > 0
    ? Math.max(...monthlyOrders.map((o) => parseInt(o.order_count || 0, 10)), 1)
    : 1;

  const maxCatSales = categorySales.length > 0
    ? Math.max(...categorySales.map((c) => parseFloat(c.total_sales || 0)), 1)
    : 1;

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return <CheckCircle size={16} className="status-icon completed" />;
      case 'PENDING':
        return <Clock size={16} className="status-icon pending" />;
      case 'PROCESSING':
      case 'SHIPPED':
        return <Truck size={16} className="status-icon transit" />;
      case 'CANCELLED':
        return <XCircle size={16} className="status-icon cancelled" />;
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };

  return (
    <div className="admin-analytics-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-subtitle">
            Sales, orders, and catalog performance.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Realized Revenue</span>
            <div className="kpi-icon-wrapper revenue">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatPrice(totalRevenue)}</div>
          <div className="kpi-subtext">Excludes cancelled orders</div>
        </div>

        <div className="analytics-kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Orders</span>
            <div className="kpi-icon-wrapper orders">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="kpi-value">{totalOrders.toLocaleString()}</div>
          <div className="kpi-subtext">
            {completedOrders} fulfilled • {pendingOrders} pending
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Units Sold</span>
            <div className="kpi-icon-wrapper products">
              <Package size={20} />
            </div>
          </div>
          <div className="kpi-value">{productsSold.toLocaleString()}</div>
          <div className="kpi-subtext">Across all completed checkouts</div>
        </div>

        <div className="analytics-kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Active Catalog</span>
            <div className="kpi-icon-wrapper catalog">
              <Layers size={20} />
            </div>
          </div>
          <div className="kpi-value">{summary?.active_products || 0}</div>
          <div className="kpi-subtext">
            {summary?.low_stock_products || 0} low stock • {summary?.out_of_stock_products || 0} out of stock
          </div>
        </div>
      </div>

      {/* Monthly Performance Visuals */}
      <div className="analytics-charts-grid">
        {/* Monthly Revenue Bar Chart */}
        <div className="analytics-chart-card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">Monthly Revenue</h2>
              <p className="chart-subtitle">Revenue progression across historical months</p>
            </div>
            <TrendingUp size={20} className="chart-header-icon" />
          </div>

          {monthlyRevenue.length === 0 ? (
            <div className="chart-empty">No revenue history available yet.</div>
          ) : (
            <div className="css-bar-chart">
              {monthlyRevenue.map((item, idx) => {
                const amount = parseFloat(item.revenue || 0);
                const heightPercent = Math.max((amount / maxRevenue) * 100, 4);
                return (
                  <div key={item.month || idx} className="chart-bar-col">
                    <div className="bar-tooltip">
                      {formatPrice(amount)}
                    </div>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill revenue-bar"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="chart-bar-label">{item.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly Orders Bar Chart */}
        <div className="analytics-chart-card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">Monthly Order Volume</h2>
              <p className="chart-subtitle">Total non-cancelled order placements</p>
            </div>
            <BarChart3 size={20} className="chart-header-icon" />
          </div>

          {monthlyOrders.length === 0 ? (
            <div className="chart-empty">No order history available yet.</div>
          ) : (
            <div className="css-bar-chart">
              {monthlyOrders.map((item, idx) => {
                const count = parseInt(item.order_count || 0, 10);
                const heightPercent = Math.max((count / maxOrders) * 100, 4);
                return (
                  <div key={item.month || idx} className="chart-bar-col">
                    <div className="bar-tooltip">{count} orders</div>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill orders-bar"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="chart-bar-label">{item.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Section: Order Status Distribution & Category Sales */}
      <div className="analytics-split-grid">
        {/* Order Status Breakdown */}
        <div className="analytics-card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">Order Status Distribution</h2>
              <p className="chart-subtitle">Fulfillment pipeline breakdown</p>
            </div>
            <PieChart size={20} className="chart-header-icon" />
          </div>

          {orderStatus.length === 0 ? (
            <div className="chart-empty">No orders placed yet.</div>
          ) : (
            <div className="status-breakdown-list">
              {orderStatus.map((item) => {
                const count = parseInt(item.order_count || 0, 10);
                const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                return (
                  <div key={item.order_status} className="status-row">
                    <div className="status-row-info">
                      <span className="status-name-wrap">
                        {getStatusIcon(item.order_status)}
                        <span className="status-name">{item.order_status}</span>
                      </span>
                      <span className="status-count">
                        <strong>{count}</strong> orders ({pct}%)
                      </span>
                    </div>
                    <div className="status-progress-track">
                      <div
                        className={`status-progress-fill status-${item.order_status?.toLowerCase()}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Performance */}
        <div className="analytics-card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">Category Performance</h2>
              <p className="chart-subtitle">Sales contribution by collection</p>
            </div>
            <Layers size={20} className="chart-header-icon" />
          </div>

          {categorySales.length === 0 ? (
            <div className="chart-empty">No category sales recorded yet.</div>
          ) : (
            <div className="category-sales-list">
              {categorySales.map((cat) => {
                const sales = parseFloat(cat.total_sales || 0);
                const pct = maxCatSales > 0 ? Math.round((sales / maxCatSales) * 100) : 0;
                return (
                  <div key={cat.category_id || cat.category_name} className="category-sale-item">
                    <div className="cat-sale-header">
                      <span className="cat-name">{cat.category_name}</span>
                      <div className="cat-figures">
                        <span className="cat-qty">{cat.products_sold || 0} sold</span>
                        <span className="cat-amount">
                          {formatPrice(sales)}
                        </span>
                      </div>
                    </div>
                    <div className="cat-progress-track">
                      <div className="cat-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Best Selling Products Ranking Table */}
      <div className="analytics-card">
        <div className="chart-card-header">
          <div>
            <h2 className="chart-title">Top Best-Selling Products</h2>
            <p className="chart-subtitle">High-velocity boutique pieces ranked by quantity sold</p>
          </div>
          <Award size={20} className="chart-header-icon" />
        </div>

        {bestSelling.length === 0 ? (
          <div className="chart-empty">No sales recorded yet.</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Units Sold</th>
                  <th style={{ textAlign: 'right' }}>Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {bestSelling.map((prod, index) => {
                  const sales = parseFloat(prod.total_sales || 0);
                  return (
                    <tr key={prod.product_id || index}>
                      <td>
                        <span className={`rank-badge rank-${index + 1}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td>
                        <span className="product-best-name">{prod.product_name}</span>
                        <span className="product-best-id">ID: #{prod.product_id}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {prod.total_quantity}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                        {formatPrice(sales)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
