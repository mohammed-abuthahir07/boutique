import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useToast } from '../../context/ToastContext';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAdminAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Admin email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        success('Admin session authorized');
        navigate('/admin/dashboard', { replace: true });
      } else {
        setErrorMessage(res.message || 'Authentication failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <Shield size={32} />
          </div>
          <span className="portal-tag">Maison Administrative Console</span>
          <h1 className="admin-login-title">Atelier Operations Sign In</h1>
          <p className="admin-login-desc">
            Restricted access portal for atelier catalog, inventory, order processing, and sales analytics.
          </p>
        </div>

        {errorMessage && (
          <div className="admin-error-box">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              Admin Email Address
            </label>
            <div className="admin-input-wrap">
              <Mail size={16} className="admin-icon" />
              <input
                id="admin-email"
                type="email"
                className="form-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Admin Password
            </label>
            <div className="admin-input-wrap">
              <Lock size={16} className="admin-icon" />
              <input
                id="admin-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-accent btn-lg w-full admin-submit-btn"
          >
            {loading ? 'Authenticating...' : 'Enter Atelier Console'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="admin-login-footer">
          <p>&copy; {new Date().getFullYear()} Maison Boutique. Authorized Personnel Only.</p>
        </div>
      </div>
    </div>
  );
}
