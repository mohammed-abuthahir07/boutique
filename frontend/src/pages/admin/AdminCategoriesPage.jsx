import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import './AdminCategoriesPage.css';

export default function AdminCategoriesPage() {
  const { success, error } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: 'ACTIVE' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, status: cat.status });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        // Update
        const res = await adminService.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          status: formData.status,
        });
        if (res.success) {
          success(res.message || 'Category updated');
          setModalOpen(false);
          loadCategories();
        }
      } else {
        // Create
        const res = await adminService.createCategory({
          name: formData.name.trim(),
        });
        if (res.success) {
          success(res.message || 'Category created');
          setModalOpen(false);
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
        {/* Search Bar */}
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
                  {/* <th>ID</th> */}
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
                    <td className="font-semibold">{cat.name}</td>
                    <td className="font-mono text-muted">{cat.slug}</td>
                    <td>
                      <span className={`badge badge-${cat.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(cat.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="text-right">
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <span className="form-hint">Slug will be automatically regenerated from the name.</span>
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
              onClick={() => setModalOpen(false)}
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

      {/* Delete Confirmation Modal */}
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
