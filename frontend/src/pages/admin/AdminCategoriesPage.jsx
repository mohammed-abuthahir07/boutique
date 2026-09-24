import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { getCategoryImageUrl } from '../../utils/categoryImage';
import './AdminCategoriesPage.css';

const EMPTY_FORM = { name: '', status: 'ACTIVE' };

function CategoryThumb({ category }) {
  const src = getCategoryImageUrl(category);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className="admin-category-thumb-fallback">No image</span>;
  }

  return (
    <img
      src={src}
      alt=""
      className="admin-category-thumb"
      onError={() => setFailed(true)}
    />
  );
}

export default function AdminCategoriesPage() {
  const { success, error } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [nameError, setNameError] = useState('');

  const clearImagePreview = (preview) => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  };

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview((prev) => {
      clearImagePreview(prev);
      return null;
    });
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCategories();
      if (res.success && Array.isArray(res.categories)) {
        setCategories(res.categories);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    return () => clearImagePreview(imagePreview);
  }, [imagePreview]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormData(EMPTY_FORM);
    resetImageState();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(EMPTY_FORM);
    resetImageState();
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, status: cat.status });
    setImageFile(null);
    setImagePreview((prev) => {
      clearImagePreview(prev);
      return getCategoryImageUrl(cat);
    });
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview((prev) => {
      clearImagePreview(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setNameError('Category name is required');
      return;
    }
    setNameError('');

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    if (editingCategory) {
      payload.append('status', formData.status);
    }
    if (imageFile) {
      payload.append('image', imageFile);
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        const res = await adminService.updateCategory(editingCategory.id, payload);
        if (res.success) {
          success(res.message || 'Category updated');
          closeModal();
          loadCategories();
        }
      } else {
        const res = await adminService.createCategory(payload);
        if (res.success) {
          success(res.message || 'Category created');
          closeModal();
          loadCategories();
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await adminService.deleteCategory(id);
      if (res.success) {
        success(res.message || 'Category deleted');
        setDeleteConfirmId(null);
        loadCategories();
      }
    } catch (err) {
      error(err.message || 'Cannot delete category because products are using it');
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-categories-page">
      <div className="page-header-row">
        <div>
          <span className="section-subtitle">Catalog Taxonomy</span>
          <h1 className="admin-page-title">Category Management</h1>
        </div>
        <button type="button" className="btn btn-accent" onClick={openCreateModal}>
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="card table-container-card">
        <div className="table-filter-bar">
          <div className="admin-search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Filter categories by name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          <span className="count-pill">{filtered.length} Categor{filtered.length === 1 ? 'y' : 'ies'}</span>
        </div>

        {loading ? (
          <Loader message="Loading categories..." />
        ) : filtered.length === 0 ? (
          <div className="admin-empty-table">
            <p>No categories found.</p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                    <tr key={cat.id}>
                      <td data-label="Image">
                        <CategoryThumb category={cat} />
                      </td>
                      <td data-label="Name" className="font-semibold">{cat.name}</td>
                      <td data-label="Slug" className="font-mono text-muted">{cat.slug}</td>
                      <td data-label="Status">
                        <span className={`badge badge-${cat.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                          {cat.status}
                        </span>
                      </td>
                      <td data-label="Created" className="text-muted">
                        {new Date(cat.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td data-label="Actions" className="text-right">
                        <div className="action-buttons-wrap">
                          <button
                            type="button"
                            className="table-action-btn edit"
                            onClick={() => openEditModal(cat)}
                            title="Edit Category"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            onClick={() => setDeleteConfirmId(cat.id)}
                            title="Delete Category"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
      >
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="cat-name">Category Name *</label>
            <input
              id="cat-name"
              type="text"
              className="form-input"
              placeholder="e.g. Sarees, Dresses, Kurtis"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (nameError) setNameError('');
              }}
              required
            />
            {nameError ? <span className="form-error">{nameError}</span> : null}
            <span className="form-hint">Slug will be automatically regenerated from the name.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cat-image">
              Category Image
            </label>
            <input
              id="cat-image"
              type="file"
              className="form-input admin-category-file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
            />
            <span className="form-hint">
              {editingCategory
                ? 'Optional. Leave empty to keep the current image.'
                : 'JPG, PNG, or WEBP. Uploaded as multipart/form-data.'}
            </span>
            {imagePreview ? (
              <div className="admin-category-preview">
                <img src={imagePreview} alt="Category preview" />
              </div>
            ) : (
              <div className="admin-category-preview admin-category-preview-empty">
                No image selected
              </div>
            )}
          </div>

          {editingCategory && (
            <div className="form-group">
              <label className="form-label" htmlFor="cat-status">Status</label>
              <select
                id="cat-status"
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          )}

          <div className="modal-actions-row">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm"
            >
              {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Category Deletion"
        maxWidth="450px"
      >
        <div className="delete-confirm-box">
          <AlertCircle size={36} className="delete-warning-icon" />
          <p>
            Are you sure you wish to delete this category? This action cannot be undone. If any products are assigned to this category, the deletion will be rejected by database constraints.
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
              Delete Category
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
