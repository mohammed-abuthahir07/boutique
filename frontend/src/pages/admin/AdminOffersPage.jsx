import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import './AdminOffersPage.css';

export default function AdminOffersPage() {
  const { success, error } = useToast();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    start_date: '',
    end_date: '',
    status: 'ACTIVE',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOffers();
      if (res.success && Array.isArray(res.offers)) {
        setOffers(res.offers);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      discount_type: 'PERCENTAGE',
      discount_value: '10',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const openEditModal = (off) => {
    setEditingOffer(off);
    setFormData({
      title: off.title,
      description: off.description || '',
      image: off.image || '',
      discount_type: off.discount_type,
      discount_value: String(off.discount_value),
      start_date: off.start_date ? off.start_date.split('T')[0] : '',
      end_date: off.end_date ? off.end_date.split('T')[0] : '',
      status: off.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      error('Title is required');
      return;
    }
    const valNum = parseFloat(formData.discount_value);
    if (isNaN(valNum) || valNum < 0) {
      error('Valid discount value is required');
      return;
    }
    if (formData.discount_type === 'PERCENTAGE' && valNum > 100) {
      error('Percentage discount cannot exceed 100');
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      error('Start and end dates are required');
      return;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      error('Start date cannot be after end date');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        image: formData.image.trim() || null,
        discount_type: formData.discount_type,
        discount_value: valNum,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      if (editingOffer) {
        payload.status = formData.status;
        const res = await adminService.updateOffer(editingOffer.id, payload);
        if (res.success) {
          success(res.message || 'Offer updated');
          setModalOpen(false);
          loadOffers();
        }
      } else {
        const res = await adminService.createOffer(payload);
        if (res.success) {
          success(res.message || 'Offer created');
          setModalOpen(false);
          loadOffers();
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await adminService.deleteOffer(id);
      if (res.success) {
        success(res.message || 'Offer deleted');
        setDeleteConfirmId(null);
        loadOffers();
      }
    } catch (err) {
      error(err.message || 'Failed to delete offer');
    }
  };

  return (
    <div className="admin-offers-page">
      <div className="page-header-row">
        <div>
          <span className="section-subtitle">Promotions & Privileges</span>
          <h1 className="admin-page-title">Seasonal Offers</h1>
        </div>
        <button type="button" className="btn btn-accent" onClick={openCreateModal}>
          <Plus size={16} /> New Offer
        </button>
      </div>

      <div className="card table-container-card">
        {loading ? (
          <Loader message="Loading seasonal offers..." />
        ) : offers.length === 0 ? (
          <div className="admin-empty-table">
            <p>No promotional offers active.</p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Offer Title</th>
                  <th>Discount</th>
                  <th>Valid Window</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((off) => (
                  <tr key={off.id}>
                    <td>
                      <div className="offer-table-cell">
                        <Tag size={16} className="text-gold" />
                        <div>
                          <h4 className="offer-table-title">{off.title}</h4>
                          {off.description && <p className="offer-table-desc">{off.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="discount-pill">
                        {off.discount_type === 'PERCENTAGE'
                          ? `${Math.round(off.discount_value)}% OFF`
                          : `₹${Number(off.discount_value).toLocaleString('en-IN')} OFF`}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(off.start_date).toLocaleDateString('en-IN')} –{' '}
                      {new Date(off.end_date).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge badge-${off.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {off.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-wrap">
                        <button
                          type="button"
                          className="table-action-btn edit"
                          onClick={() => openEditModal(off)}
                          title="Edit Offer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn delete"
                          onClick={() => setDeleteConfirmId(off.id)}
                          title="Delete Offer"
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
        title={editingOffer ? `Edit Offer: ${editingOffer.title}` : 'Create New Promotional Offer'}
      >
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="off-title">
              Offer Title *
            </label>
            <input
              id="off-title"
              type="text"
              className="form-input"
              placeholder="e.g. Festive Silk Privilege"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="off-desc">
              Description
            </label>
            <textarea
              id="off-desc"
              rows={3}
              className="form-textarea"
              placeholder="e.g. 20% privilege on handcrafted Chanderi and Banarasi collections"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="off-type">
                Discount Type *
              </label>
              <select
                id="off-type"
                className="form-select"
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
              >
                <option value="PERCENTAGE">PERCENTAGE (%)</option>
                <option value="FIXED">FIXED AMOUNT (INR)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="off-val">
                Discount Value *
              </label>
              <input
                id="off-val"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                placeholder={formData.discount_type === 'PERCENTAGE' ? '20' : '1000'}
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="off-start">
                Start Date *
              </label>
              <input
                id="off-start"
                type="date"
                className="form-input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="off-end">
                End Date *
              </label>
              <input
                id="off-end"
                type="date"
                className="form-input"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          {editingOffer && (
            <div className="form-group">
              <label className="form-label" htmlFor="off-status">
                Status
              </label>
              <select
                id="off-status"
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
              {submitting ? 'Saving...' : editingOffer ? 'Update Offer' : 'Create Offer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Offer Deletion"
        maxWidth="440px"
      >
        <div className="delete-confirm-box">
          <p>Are you sure you wish to delete this promotional offer? It will no longer be visible to customers.</p>
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
              Delete Offer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
