import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useToast } from '../../context/ToastContext';
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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="auth-standalone">
      <div className="auth-card">
        <Link to="/" className="auth-close" aria-label="Back to home page">
          <X size={20} />
        </Link>
        <Link to="/" className="auth-brand" aria-label="Sri Annai Boutique home">
          <span className="auth-brand-main">SRI ANNAI</span>
          <span className="auth-brand-sub">Boutique</span>
        </Link>

        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join our boutique community</p>
        </div>

        {serverError && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">Name</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                id="reg-name"
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoComplete="name"
              />
            </div>
            {formErrors.name && <p className="form-error">{formErrors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
              />
            </div>
            {formErrors.email && <p className="form-error">{formErrors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone" className="form-label">Phone</label>
            <div className="input-with-icon">
              <Phone size={16} className="input-icon" />
              <input
                id="reg-phone"
                type="tel"
                className="form-input"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                autoComplete="tel"
              />
            </div>
            {formErrors.phone && <p className="form-error">{formErrors.phone}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input auth-input-with-toggle"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formErrors.password && <p className="form-error">{formErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full auth-submit"
          >
            {loading ? 'Creating account...' : 'Create account'} <ArrowRight size={16} />
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
