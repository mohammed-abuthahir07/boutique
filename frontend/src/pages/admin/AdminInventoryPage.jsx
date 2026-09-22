import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Search, AlertTriangle, CheckCircle, Sliders } from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import './AdminInventoryPage.css';

export default function AdminInventoryPage() {
  const { error } = useToast();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL'); // 'ALL', 'OUT', 'LOW', 'HEALTHY'

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await adminService.getInventory();
      if (res.success && Array.isArray(res.inventory)) {
        setInventory(res.inventory);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filtered = inventory.filter((item) => {
    const matchSearch =
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category_name && item.category_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const stock = Number(item.stock);
    let matchStock = true;
    if (stockStatusFilter === 'OUT') matchStock = stock <= 0;
    else if (stockStatusFilter === 'LOW') matchStock = stock > 0 && stock <= 5;
    else if (stockStatusFilter === 'HEALTHY') matchStock = stock > 5;

    return matchSearch && matchStock;
  });

  const outOfStockCount = inventory.filter((i) => Number(i.stock) <= 0).length;
  const lowStockCount = inventory.filter((i) => Number(i.stock) > 0 && Number(i.stock) <= 5).length;
  const healthyStockCount = inventory.filter((i) => Number(i.stock) > 5).length;

  return (
    <div className="admin-inventory-page">
      <div className="page-header-row">
        <div>
          <span className="section-subtitle">Stock Control & Replenishment</span>
          <h1 className="admin-page-title">Atelier Inventory Status</h1>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="inventory-stats-grid">
        <div className="card inv-stat-card">
          <div className="inv-stat-icon-wrap primary">
            <Boxes size={20} />
          </div>
          <div>
            <span className="inv-stat-lbl">Total Catalog SKUs</span>
            <h3 className="inv-stat-val">{inventory.length}</h3>
          </div>
        </div>

        <div className="card inv-stat-card">
          <div className="inv-stat-icon-wrap success">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="inv-stat-lbl">Optimal Stock (&gt; 5 units)</span>
            <h3 className="inv-stat-val text-success">{healthyStockCount}</h3>
          </div>
        </div>

        <div className="card inv-stat-card">
          <div className="inv-stat-icon-wrap warning">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="inv-stat-lbl">Low Stock Alert (1-5 units)</span>
            <h3 className="inv-stat-val text-warning">{lowStockCount}</h3>
          </div>
        </div>

        <div className="card inv-stat-card">
          <div className="inv-stat-icon-wrap danger">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="inv-stat-lbl">Depleted / Sold Out</span>
            <h3 className="inv-stat-val text-danger">{outOfStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card table-container-card">
        <div className="table-filter-bar">
          <div className="admin-search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search product inventory by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="stock-filters-row">
            <button
              type="button"
              className={`stock-filter-btn ${stockStatusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStockStatusFilter('ALL')}
            >
              All Levels
            </button>
            <button
              type="button"
              className={`stock-filter-btn ${stockStatusFilter === 'LOW' ? 'active' : ''}`}
              onClick={() => setStockStatusFilter('LOW')}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              type="button"
              className={`stock-filter-btn ${stockStatusFilter === 'OUT' ? 'active' : ''}`}
              onClick={() => setStockStatusFilter('OUT')}
            >
              Out of Stock ({outOfStockCount})
            </button>
            <button
              type="button"
              className={`stock-filter-btn ${stockStatusFilter === 'HEALTHY' ? 'active' : ''}`}
              onClick={() => setStockStatusFilter('HEALTHY')}
            >
              Optimal ({healthyStockCount})
            </button>
          </div>
        </div>

        {loading ? (
          <Loader message="Assessing inventory levels across atelier..." />
        ) : filtered.length === 0 ? (
          <div className="admin-empty-table">
            <p>No inventory records match the selected filter.</p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Retail Price</th>
                  <th>Aggregated Stock</th>
                  <th>Inventory Status</th>
                  <th>Catalog Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const stock = Number(item.stock);
                  const isDepleted = stock <= 0;
                  const isLow = stock > 0 && stock <= 5;

                  return (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/admin/products/${item.id}`} className="inventory-prod-link">
                          {item.product_name}
                        </Link>
                        <span className="font-mono text-muted d-block font-xs">#{item.id}</span>
                      </td>
                      <td>
                        <span className="category-pill">{item.category_name}</span>
                      </td>
                      <td className="font-semibold">{formatPrice(item.price)}</td>
                      <td>
                        <strong className="font-serif font-base">{stock} units</strong>
                      </td>
                      <td>
                        {isDepleted ? (
                          <span className="badge badge-danger">Depleted (0)</span>
                        ) : isLow ? (
                          <span className="badge badge-warning">Low Stock ({stock})</span>
                        ) : (
                          <span className="badge badge-success">In Stock</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${item.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link
                          to={`/admin/products/${item.id}`}
                          className="btn btn-outline-gold btn-sm"
                          title="Manage Variant Stock & Colors"
                        >
                          <Sliders size={13} /> Manage Variants
                        </Link>
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
