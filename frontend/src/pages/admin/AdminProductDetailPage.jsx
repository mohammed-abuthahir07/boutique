import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Layers,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { getImageUrl, FALLBACK_PRODUCT_IMAGE } from '../../config/apiConfig';
import './AdminProductDetailPage.css';

export default function AdminProductDetailPage() {
  const { id } = useParams();
  const { success, error } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Variant Modal State
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({ color: '', size: '', stock: '' });
  const [variantSubmitting, setVariantSubmitting] = useState(false);
  const [deleteVariantId, setDeleteVariantId] = useState(null);

  // Color Image Upload State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadColor, setUploadColor] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Delete Image State
  const [deleteImageTarget, setDeleteImageTarget] = useState(null); // { color, imageId }

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProductById(id);
      if (res.success && res.product) {
        setProduct(res.product);
      } else {
        error('Failed to load product details');
      }
    } catch (err) {
      error(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  // Group variants by color
  const variantsByColor = useMemo(() => {
    if (!product || !product.variants) return {};
    const groups = {};
    product.variants.forEach((v) => {
      const col = v.color.trim();
      if (!groups[col]) groups[col] = [];
      groups[col].push(v);
    });
    return groups;
  }, [product]);

  // Group color images by color
  const colorImagesByColor = useMemo(() => {
    if (!product || !product.color_images) return {};
    const groups = {};
    product.color_images.forEach((ci) => {
      const col = ci.color.trim();
      if (!groups[col]) groups[col] = [];
      groups[col].push(ci);
    });
    return groups;
  }, [product]);

  // All distinct colors present in variants or color images
  const allColors = useMemo(() => {
    const set = new Set();
    Object.keys(variantsByColor).forEach((c) => set.add(c));
    Object.keys(colorImagesByColor).forEach((c) => set.add(c));
    return Array.from(set);
  }, [variantsByColor, colorImagesByColor]);

  // Variant Actions
  const openAddVariantModal = (defaultColor = '') => {
    setEditingVariant(null);
    setVariantForm({ color: defaultColor, size: '', stock: '5' });
    setVariantModalOpen(true);
  };

  const openEditVariantModal = (v) => {
    setEditingVariant(v);
    setVariantForm({ color: v.color, size: v.size, stock: String(v.stock) });
    setVariantModalOpen(true);
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    if (!variantForm.color.trim()) {
      error('Color name is required');
      return;
    }
    if (!variantForm.size.trim()) {
      error('Size is required');
      return;
    }
    const stockVal = parseInt(variantForm.stock, 10);
    if (isNaN(stockVal) || stockVal < 0) {
      error('Valid stock quantity is required');
      return;
    }

    setVariantSubmitting(true);
    try {
      if (editingVariant) {
        const res = await adminService.updateVariant(id, editingVariant.id, {
          color: variantForm.color.trim(),
          size: variantForm.size.trim(),
          stock: stockVal,
        });
        if (res.success) {
          success(res.message || 'Variant updated');
          setVariantModalOpen(false);
          loadProduct();
        }
      } else {
        const res = await adminService.createVariant(id, {
          color: variantForm.color.trim(),
          size: variantForm.size.trim(),
          stock: stockVal,
        });
        if (res.success) {
          success(res.message || 'Variant created');
          setVariantModalOpen(false);
          loadProduct();
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save variant');
    } finally {
      setVariantSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      const res = await adminService.deleteVariant(id, variantId);
      if (res.success) {
        success(res.message || 'Variant removed');
        setDeleteVariantId(null);
        loadProduct();
      }
    } catch (err) {
      error(err.message || 'Failed to delete variant');
    }
  };

  // Image Actions
  const openUploadModal = (color) => {
    setUploadColor(color);
    setSelectedFiles([]);
    setUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadColor.trim()) {
      error('Color is required');
      return;
    }
    if (!selectedFiles || selectedFiles.length === 0) {
      error('Please select at least one image file');
      return;
    }

    setUploading(true);
    try {
      const res = await adminService.uploadColorImages(id, uploadColor.trim(), selectedFiles);
      if (res.success) {
        success(res.message || 'Images uploaded successfully');
        setUploadModalOpen(false);
        setSelectedFiles([]);
        loadProduct();
      }
    } catch (err) {
      error(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!deleteImageTarget) return;
    try {
      const res = await adminService.deleteColorImage(
        id,
        deleteImageTarget.color,
        deleteImageTarget.imageId
      );
      if (res.success) {
        success(res.message || 'Image deleted');
        setDeleteImageTarget(null);
        loadProduct();
      }
    } catch (err) {
      error(err.message || 'Failed to delete color image');
    }
  };

  if (loading) {
    return <Loader message="Accessing product atelier matrix..." />;
  }

  if (!product) {
    return (
      <div className="admin-product-detail-page">
        <p>Product not found.</p>
        <Link to="/admin/products" className="btn btn-outline btn-sm">
          Return to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-product-detail-page">
      {/* Header */}
      <div className="detail-header-card card">
        <div className="detail-header-left">
          <Link to="/admin/products" className="back-link">
            <ArrowLeft size={16} /> Back to Products
          </Link>
          <span className="product-category-eyebrow">{product.category_name}</span>
          <h1 className="product-title-heading">{product.name}</h1>
          <p className="product-desc-text">{product.description || 'No description provided.'}</p>
        </div>

        <div className="detail-header-right">
          <div className="header-meta-item">
            <span className="meta-lbl">Retail Price</span>
            <span className="meta-val price-val">
              ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="header-meta-item">
            <span className="meta-lbl">Catalog Status</span>
            <span className={`badge badge-${product.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
              {product.status}
            </span>
          </div>
          <div className="header-meta-item">
            <span className="meta-lbl">Product Base Stock</span>
            <span className="meta-val">{product.stock} units</span>
          </div>
          <Link to={`/admin/products/edit/${product.id}`} className="btn btn-outline-gold btn-sm">
            <Edit2 size={14} /> Edit Core Details
          </Link>
        </div>
      </div>

      {/* Top Action Bar for Variants */}
      <div className="matrix-action-bar">
        <div>
          <h2 className="section-matrix-title">Color, Variant & Image Matrix</h2>
          <p className="section-matrix-subtitle">
            Organize sizing stock and color-specific lookbook photography for client selection.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => openAddVariantModal()}
        >
          <Plus size={15} /> Add Variant Combination
        </button>
      </div>

      {/* Color Groups List */}
      {allColors.length === 0 ? (
        <div className="card empty-matrix-card">
          <Layers size={36} className="text-gold" />
          <h3>No Color Variants Configured</h3>
          <p>
            Add color variants (e.g. Maroon, Navy Blue) and their respective sizes (S, M, L) so customers can select and purchase this silhouette.
          </p>
          <button
            type="button"
            className="btn btn-accent btn-sm"
            onClick={() => openAddVariantModal()}
          >
            <Plus size={15} /> Add First Variant
          </button>
        </div>
      ) : (
        <div className="color-groups-container">
          {allColors.map((colorName) => {
            const variants = variantsByColor[colorName] || [];
            const images = colorImagesByColor[colorName] || [];
            const totalColorStock = variants.reduce((sum, v) => sum + Number(v.stock), 0);

            return (
              <div key={colorName} className="card color-group-card">
                <div className="color-group-header">
                  <div className="color-title-group">
                    <span className="color-indicator-swatch"></span>
                    <h3 className="color-group-name">{colorName}</h3>
                    <span className="color-stock-badge">
                      Total {colorName} Stock: <strong>{totalColorStock} units</strong>
                    </span>
                  </div>

                  <div className="color-actions-group">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => openUploadModal(colorName)}
                    >
                      <Upload size={14} /> Upload Images for {colorName}
                    </button>
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      onClick={() => openAddVariantModal(colorName)}
                    >
                      <Plus size={14} /> Add Size
                    </button>
                  </div>
                </div>

                {/* Two Panels: Sizes Table & Color Images Gallery */}
                <div className="color-group-body">
                  {/* Left: Size Variants Table */}
                  <div className="variants-table-col">
                    <h4 className="sub-panel-title">Sizing Stock Configuration</h4>
                    {variants.length === 0 ? (
                      <p className="no-items-text">No sizes added for {colorName} yet.</p>
                    ) : (
                      <table className="admin-variants-table">
                        <thead>
                          <tr>
                            <th>Size Fit</th>
                            <th>Available Stock</th>
                            <th className="text-right">Manage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v) => (
                            <tr key={v.id}>
                              <td>
                                <span className="size-badge-pill">{v.size}</span>
                              </td>
                              <td>
                                <span className={`stock-text ${Number(v.stock) <= 0 ? 'depleted' : ''}`}>
                                  {v.stock} unit{v.stock === 1 ? '' : 's'}
                                </span>
                              </td>
                              <td className="text-right">
                                <div className="action-buttons-wrap">
                                  <button
                                    type="button"
                                    className="table-action-btn edit"
                                    onClick={() => openEditVariantModal(v)}
                                    title="Edit Variant Stock"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    className="table-action-btn delete"
                                    onClick={() => setDeleteVariantId(v.id)}
                                    title="Delete Variant"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Right: Color Specific Images Gallery */}
                  <div className="color-images-col">
                    <h4 className="sub-panel-title">
                      Lookbook Images for {colorName} ({images.length})
                    </h4>
                    {images.length === 0 ? (
                      <div className="no-images-box">
                        <ImageIcon size={24} className="text-muted" />
                        <p>No photography uploaded for {colorName}.</p>
                        <button
                          type="button"
                          className="btn btn-outline-gold btn-sm"
                          onClick={() => openUploadModal(colorName)}
                        >
                          <Upload size={13} /> Upload Images
                        </button>
                      </div>
                    ) : (
                      <div className="color-images-grid">
                        {images.map((img) => (
                          <div key={img.id} className="admin-color-img-wrap">
                            <img
                              src={getImageUrl(img.image)}
                              alt={`${colorName} view`}
                              className="admin-color-img"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = FALLBACK_PRODUCT_IMAGE;
                              }}
                            />
                            <button
                              type="button"
                              className="delete-img-btn"
                              onClick={() =>
                                setDeleteImageTarget({
                                  color: colorName,
                                  imageId: img.id,
                                })
                              }
                              title="Delete this image"
                            >
                              <X size={14} />
                            </button>
                            <span className="order-tag">#{img.sort_order}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Variant Modal */}
      <Modal
        isOpen={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        title={editingVariant ? `Edit Variant: ${editingVariant.color} / ${editingVariant.size}` : 'Add Product Variant'}
      >
        <form onSubmit={handleVariantSubmit} className="admin-modal-form">
          <div className="form-group">
            <label htmlFor="var-color" className="form-label">
              Color Name *
            </label>
            <input
              id="var-color"
              type="text"
              className="form-input"
              placeholder="e.g. Maroon, Royal Blue, Champagne"
              value={variantForm.color}
              onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="var-size" className="form-label">
              Size *
            </label>
            <input
              id="var-size"
              type="text"
              className="form-input"
              placeholder="e.g. XS, S, M, L, XL, XXL, Free Size"
              value={variantForm.size}
              onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="var-stock" className="form-label">
              Variant Stock Units *
            </label>
            <input
              id="var-stock"
              type="number"
              min="0"
              className="form-input"
              value={variantForm.stock}
              onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
              required
            />
            <span className="form-hint">Number of pieces physically ready in the atelier.</span>
          </div>

          <div className="modal-actions-row">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setVariantModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={variantSubmitting}
              className="btn btn-primary btn-sm"
            >
              {variantSubmitting ? 'Saving...' : editingVariant ? 'Update Variant' : 'Create Variant'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Color Images Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title={`Upload Images for Color: ${uploadColor}`}
      >
        <form onSubmit={handleUploadSubmit} className="admin-modal-form">
          <div className="form-group">
            <label htmlFor="upload-color" className="form-label">
              Target Color
            </label>
            <input
              id="upload-color"
              type="text"
              className="form-input"
              value={uploadColor}
              onChange={(e) => setUploadColor(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="upload-files" className="form-label">
              Select Images (Max 10 files, JPEG/PNG/WebP, max 5MB each) *
            </label>
            <input
              id="upload-files"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="form-input"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              required
            />
            <span className="form-hint">
              {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'} selected.
            </span>
          </div>

          <div className="modal-actions-row">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setUploadModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="btn btn-primary btn-sm"
            >
              <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Variant Modal */}
      <Modal
        isOpen={Boolean(deleteVariantId)}
        onClose={() => setDeleteVariantId(null)}
        title="Confirm Variant Deletion"
        maxWidth="440px"
      >
        <div className="delete-confirm-box">
          <p>
            Are you sure you wish to delete this size/color variant? Customers will no longer be able to purchase this fit.
          </p>
          <div className="modal-actions-row">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDeleteVariantId(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => handleDeleteVariant(deleteVariantId)}
            >
              Delete Variant
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Image Modal */}
      <Modal
        isOpen={Boolean(deleteImageTarget)}
        onClose={() => setDeleteImageTarget(null)}
        title="Confirm Image Deletion"
        maxWidth="440px"
      >
        <div className="delete-confirm-box">
          <p>Are you sure you wish to delete this color-specific photograph from the catalog?</p>
          <div className="modal-actions-row">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDeleteImageTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDeleteImage}
            >
              Delete Image
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
