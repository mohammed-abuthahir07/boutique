import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Camera, Shield, Save } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import customerService from '../../services/customerService';
import Loader from '../../components/common/Loader';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import AccountNav from '../../components/common/AccountNav';
import Modal from '../../components/common/Modal';
import { getImageUrl, FALLBACK_AVATAR } from '../../config/apiConfig';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { refreshProfile, logout } = useCustomerAuth();
  const { clearCartState } = useCart();
  const { clearWishlistState } = useWishlist();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const deleteInFlightRef = useRef(false);

  // Fetch full profile (which includes profile_image and timestamps)
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await customerService.getProfile();
        if (isMounted && res.success && res.customer) {
          setProfileData(res.customer);
          setFormData({
            name: res.customer.name || '',
            phone: res.customer.phone || '',
          });
        }
      } catch (err) {
        if (isMounted) {
          error(err.message || 'Failed to load profile details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormErrors({ name: 'Name must be at least 2 characters' });
      return;
    }
    setFormErrors({});

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('phone', formData.phone.trim());
      if (imageFile) {
        payload.append('profile_image', imageFile);
      }

      const res = await customerService.updateProfile(payload);

      if (res.success && res.customer) {
        success(res.message || 'Profile updated successfully');
        setProfileData(res.customer);
        setImageFile(null);
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
          setImagePreview(null);
        }
        await refreshProfile();
      }
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const closeDeleteModal = () => {
    if (deletingAccount) return;
    setDeleteModalOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteInFlightRef.current || deletingAccount) {
      return;
    }

    deleteInFlightRef.current = true;
    setDeletingAccount(true);

    try {
      const res = await customerService.deleteAccount();

      if (!res.success) {
        error(res.message || 'Unable to delete your account. Please try again.');
        return;
      }

      clearCartState();
      clearWishlistState();
      logout();
      success(res.message || 'Your account has been deleted successfully.');
      navigate('/login', { replace: true });
    } catch (err) {
      error(err.message || 'Unable to delete your account. Please try again.');
    } finally {
      deleteInFlightRef.current = false;
      setDeletingAccount(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <Loader fullScreen message="Loading client portfolio..." />;
  }

  const avatarUrl = imagePreview || getImageUrl(profileData?.profile_image) || FALLBACK_AVATAR;

  return (
    <div className="profile-page">
      <Breadcrumbs items={[{ label: 'Client Portfolio' }]} />

      <div className="container profile-container account-page-layout">
        <AccountNav />
        <div>
        <div className="profile-header">
          <span className="section-subtitle">Private Atelier Membership</span>
          <h1 className="profile-title">Personal Account & Preferences</h1>
          <p className="profile-subtitle">
            Manage your personal profile and dispatch contact details for bespoke commissions.
          </p>
        </div>

        <div className="profile-grid">
          {/* Profile Overview Card */}
          <div className="profile-summary-col">
            <div className="card profile-card">
              <div className="profile-avatar-wrap">
                <img
                  src={avatarUrl}
                  alt={profileData?.name || 'Customer Avatar'}
                  className="profile-avatar-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_AVATAR;
                  }}
                />
                <label className="profile-avatar-change">
                  <Camera size={14} />
                  Change photo
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>
              </div>

              <h3 className="profile-name">{profileData?.name}</h3>
              <p className="profile-email">{profileData?.email}</p>

              <div className="profile-status-pill">
                <Shield size={14} className="status-icon" />
                <span>Account Status: <strong>{profileData?.status || 'ACTIVE'}</strong></span>
              </div>

              <div className="profile-meta-list">
                <div className="meta-line">
                  <Calendar size={14} />
                  <span>Member Since: {formatDate(profileData?.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="profile-edit-col">
            <div className="card edit-card">
              <h3 className="card-section-title">Edit Account Details</h3>
              <div className="gold-divider"></div>
              <p className="card-subtext">
                Your email address is securely bound to your client credentials. You can update your display name and mobile number.
              </p>

              <form onSubmit={handleSubmit} className="profile-form" noValidate>
                {/* Name */}
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Legal / Display Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                </div>

                {/* Email (Readonly) */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address (Account Identifier)
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-input form-input-disabled"
                    value={profileData?.email || ''}
                    disabled
                  />
                  <span className="form-hint">Email address cannot be modified once verified.</span>
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Courier Contact Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <span className="form-hint">Used for dispatch updates and doorstep verification.</span>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    <Save size={16} />
                    {saving ? 'Saving changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <section className="card profile-account-settings">
          <h3 className="card-section-title">Account Settings</h3>
          <div className="gold-divider"></div>
          <div className="profile-danger-zone">
            <h4 className="profile-danger-title">Danger Zone</h4>
            <p className="card-subtext">
              Deleting your account will permanently remove your profile,
              cart, favorites and active order history from your account.
            </p>
            <p className="card-subtext">
              Your completed order history will be securely archived
              for business records.
            </p>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setDeleteModalOpen(true)}
              disabled={deletingAccount}
            >
              Delete Account
            </button>
          </div>
        </section>
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Account?"
        maxWidth="480px"
      >
        <p className="profile-delete-copy">
          Are you sure you want to permanently delete your account?
        </p>
        <p className="profile-delete-copy">
          Your profile, cart and favorites will be deleted. Your order
          history will be archived for business records.
        </p>
        <div className="profile-delete-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={closeDeleteModal}
            disabled={deletingAccount}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
          >
            {deletingAccount ? 'Deleting Account...' : 'Delete My Account'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
