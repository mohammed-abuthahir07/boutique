import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useToast } from '../../context/ToastContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './RegisterPage.css';

export default function RegisterPage() {
  const { register } = useCustomerAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/shop';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    }

    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (res.success) {
        success('Account created successfully! Welcome to Maison Boutique.');
        navigate(redirectPath, { replace: true });
      } else {
        setServerError(res.message || 'Registration failed');
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Breadcrumbs items={[{ label: 'Create Account' }]} />

      <div className="container register-container">
        <div className="register-card card">
          <div className="register-header">
            <span className="section-subtitle">Private Atelier Membership</span>
            <h1 className="register-title">Create an Account</h1>
            <p className="register-subtitle">
              Join the Maison circle for private sale access, bespoke curation, and express ordering.
            </p>
          </div>

          {serverError && (
            <div className="register-error-banner">
              <AlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            {/* Name */}
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">
                Full Name *
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maharani Gayatri Devi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              {formErrors.name && <p className="form-error">{formErrors.name}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">
                Email Address *
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  className="form-input"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {formErrors.email && <p className="form-error">{formErrors.email}</p>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="reg-phone" className="form-label">
                Phone Number *
              </label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  id="reg-phone"
                  type="tel"
                  className="form-input"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              {formErrors.phone && <p className="form-error">{formErrors.phone}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">
                Password (min. 6 characters) *
              </label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="reg-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {formErrors.password && <p className="form-error">{formErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full register-submit-btn"
            >
              {loading ? 'Creating Membership...' : 'Register Account'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already an esteemed client?{' '}
              <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="auth-link">
                Sign In to Your Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
