import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import { getImageUrl, FALLBACK_PRODUCT_IMAGE } from '../../config/apiConfig';
import './AdminProductFormPage.css';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        setLoading(true);
        // Fetch active categories
        const catRes = await adminService.getCategories();
        if (catRes.success && isMounted) {
          setCategories(catRes.categories || []);
        }

        // If editing, fetch product details
        if (isEdit) {
          const prodRes = await adminService.getProductById(id);
          if (prodRes.success && prodRes.product && isMounted) {
            const p = prodRes.product;
            setFormData({
              category_id: String(p.category_id),
              name: p.name,
              description: p.description || '',
              price: String(p.price),
              stock: String(p.stock),
              image: p.image || '',
              status: p.status || 'ACTIVE',
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          error(err.message || 'Failed to initialize product form');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [id, isEdit, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_id) {
      error('Please select a category');
      return;
    }
    if (!formData.name.trim()) {
      error('Product name is required');
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      error('Valid product price is required');
      return;
    }
    const stockNum = parseInt(formData.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      error('Valid product stock is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category_id: Number(formData.category_id),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: priceNum,
        stock: stockNum,
        image: formData.image.trim() || null,
      };

      if (isEdit) {
        payload.status = formData.status;
        const res = await adminService.updateProduct(id, payload);
        if (res.success) {
          success(res.message || 'Product updated successfully');
          navigate('/admin/products');
        }
      } else {
        const res = await adminService.createProduct(payload);
        if (res.success && res.product) {
          success(res.message || 'Product created successfully');
          // Navigate to product detail page to configure variants and color images
          navigate(`/admin/products/${res.product.id}`);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading form specifications..." />;
  }

  return (
    <div className="admin-product-form-page">
      <div className="form-header">
        <Link to="/admin/products" className="back-link">
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <span className="section-subtitle">Catalog Specification</span>
        <h1 className="admin-page-title">
          {isEdit ? `Edit Product: ${formData.name}` : 'Create New Silhouette'}
        </h1>
        <p className="form-lead-text">
          Define core product attributes. You can configure color variants and upload high-resolution color lookbook images after creation.
        </p>
      </div>

      <div className="form-grid">
        <form onSubmit={handleSubmit} className="card product-form-card">
          <h3 className="card-section-title">Core Information</h3>
          <div className="gold-divider"></div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="prod-category" className="form-label">
              Category *
            </label>
            <select
              id="prod-category"
              className="form-select"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              required
            >
              <option value="">-- Choose Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="form-group">
            <label htmlFor="prod-name" className="form-label">
              Product Name *
            </label>
            <input
              id="prod-name"
              type="text"
              className="form-input"
              placeholder="e.g. Floral Printed Silk Kurti"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="prod-desc" className="form-label">
              Description & Fabric Details
            </label>
            <textarea
              id="prod-desc"
              rows={4}
              className="form-textarea"
              placeholder="Describe weave, zari embroidery, occasion suitability, and fabric composition..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Price & Stock Row */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="prod-price" className="form-label">
                Base Retail Price (INR) *
              </label>
              <input
                id="prod-price"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="1999.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prod-stock" className="form-label">
                Product-Level Base Stock *
              </label>
              <input
                id="prod-stock"
                type="number"
                min="0"
                className="form-input"
                placeholder="10"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
              <span className="form-hint">Overall aggregated stock units.</span>
            </div>
          </div>

          {/* Image Path / URL */}
          <div className="form-group">
            <label htmlFor="prod-img" className="form-label">
              Primary Image Path or URL
            </label>
            <input
              id="prod-img"
              type="text"
              className="form-input"
              placeholder="/uploads/products/xyz.jpg or external URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
            <span className="form-hint">
              You can also upload color-specific images after saving the product.
            </span>
          </div>

          {/* Status (If Edit) */}
          {isEdit && (
            <div className="form-group">
              <label htmlFor="prod-status" className="form-label">
                Catalog Status
              </label>
              <select
                id="prod-status"
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          )}

          <div className="form-footer-buttons">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm"
            >
              <Save size={15} />
              {submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create & Manage Variants'}
            </button>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="preview-column">
          <div className="card preview-card">
            <h4 className="preview-heading">Listing Preview</h4>
            <div className="gold-divider"></div>
            <div className="preview-image-box">
              <img
                src={getImageUrl(formData.image) || FALLBACK_PRODUCT_IMAGE}
                alt="Preview"
                className="preview-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_PRODUCT_IMAGE;
                }}
              />
            </div>
            <div className="preview-info">
              <span className="preview-cat">
                {categories.find((c) => String(c.id) === String(formData.category_id))?.name || 'Category'}
              </span>
              <h4 className="preview-name">{formData.name || 'Creation Title'}</h4>
              <p className="preview-price">
                ₹{Number(formData.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
