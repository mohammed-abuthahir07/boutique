import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Sliders, Image as ImageIcon, Layers } from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { getImageUrl, FALLBACK_PRODUCT_IMAGE } from '../../config/apiConfig';
import './AdminProductsPage.css';

export default function AdminProductsPage() {
  const { success, error } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProducts();
      if (res.success && Array.isArray(res.products)) {
        setProducts(res.products);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await adminService.deleteProduct(id);
      if (res.success) {
        success(res.message || 'Product deleted');
        setDeleteConfirmId(null);
        loadProducts();
      }
    } catch (err) {
      error(err.message || 'Failed to delete product');
    }
  };

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const categories = Array.from(
    new Set(products.map((p) => p.category_name).filter(Boolean))
  );

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = !categoryFilter || p.category_name === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="admin-products-page">
      <div className="page-header-row">
        <div>
          <span className="section-subtitle">Catalog Inventory</span>
          <h1 className="admin-page-title">Products</h1>
        </div>
        <Link to="/admin/products/new" className="btn btn-accent">
          <Plus size={16} /> New Product
        </Link>
      </div>

      <div className="card table-container-card">
        <div className="table-filter-bar">
          <div className="admin-search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by product name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="filter-controls-right">
            <select
              className="form-select admin-cat-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="count-pill">{filtered.length} Product{filtered.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {loading ? (
          <Loader message="Fetching product catalog..." />
        ) : filtered.length === 0 ? (
          <div className="admin-empty-table">
            <p>No products match your criteria.</p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Creation</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th>Total Stock</th>
                  <th>Variants / Colors</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prod) => {
                  const imgUrl = getImageUrl(prod.image) || FALLBACK_PRODUCT_IMAGE;
                  const variantsCount = prod.variants ? prod.variants.length : 0;
                  const colorsCount = prod.colors ? prod.colors.length : 0;

                  return (
                    <tr key={prod.id}>
                      <td data-label="Product">
                        <div className="product-table-cell">
                          <img
                            src={imgUrl}
                            alt={prod.name}
                            className="product-thumb-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = FALLBACK_PRODUCT_IMAGE;
                            }}
                          />
                          <div>
                            <h4 className="prod-table-name">
                              <Link to={`/admin/products/${prod.id}`}>{prod.name}</Link>
                            </h4>
                          </div>
                        </div>
                      </td>
                      <td data-label="Category">
                        <span className="category-pill">{prod.category_name || 'Unassigned'}</span>
                      </td>
                      <td className="font-semibold" data-label="Price">{formatPrice(prod.price)}</td>
                      <td data-label="Stock">
                        <span className={`stock-badge ${Number(prod.stock) <= 5 ? 'low' : ''}`}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td data-label="Variants">
                        <Link
                          to={`/admin/products/${prod.id}`}
                          className="variant-link-pill"
                          title="Manage color variants and color-specific images"
                        >
                          <Layers size={13} />
                          <span>{variantsCount} Variants</span>
                          <span>&bull;</span>
                          <ImageIcon size={13} />
                          <span>{colorsCount} Color Sets</span>
                        </Link>
                      </td>
                      <td data-label="Status">
                        <span className={`badge badge-${prod.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                          {prod.status}
                        </span>
                      </td>
                      <td className="text-right" data-label="Actions">
                        <div className="action-buttons-wrap">
                          <Link
                            to={`/admin/products/${prod.id}`}
                            className="table-action-btn"
                            title="Manage Variants & Color Images"
                          >
                            <Sliders size={15} />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${prod.id}`}
                            className="table-action-btn edit"
                            title="Edit Core Product"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            onClick={() => setDeleteConfirmId(prod.id)}
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Product Deletion"
        maxWidth="460px"
      >
        <div className="delete-confirm-box">
          <p>
            Are you sure you wish to delete this product? All associated variants, color images, and inventory records will also be removed from the catalog.
          </p>
          <div className="modal-actions-row">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete(deleteConfirmId)}
            >
              Delete Product
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
