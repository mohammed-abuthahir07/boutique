import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useToast } from '../../context/ToastContext';
import { GOOGLE_CLIENT_ID } from '../../config/apiConfig';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './LoginPage.css';

export default function LoginPage() {
  const { login, googleLogin, isAuthenticated } = useCustomerAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/shop';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const googleBtnRef = useRef(null);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Google Login initialization
  useEffect(() => {
    if (window.google?.accounts?.id && GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              try {
                const res = await googleLogin(response.credential);
                if (res.success) {
                  success('Welcome! Signed in with Google.');
                  navigate(redirectPath, { replace: true });
                }
              } catch (err) {
                error(err.message || 'Google authentication failed');
              } finally {
                setLoading(false);
              }
            }
          },
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      } catch (err) {
        console.error('Google Sign-In initialization error:', err);
      }
    }
  }, [googleLogin, navigate, redirectPath, success, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(formData.email.trim(), formData.password);
      if (res.success) {
        success('Welcome back to Maison Boutique.');
        navigate(redirectPath, { replace: true });
      } else {
        setErrorMessage(res.message || 'Login failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Breadcrumbs items={[{ label: 'Sign In' }]} />

      <div className="container login-container">
        <div className="login-card card">
          <div className="login-header">
            <span className="section-subtitle">Client Portal</span>
            <h1 className="login-title">Sign In to Maison</h1>
            <p className="login-subtitle">
              Enter your credentials to access your private wishlist, past orders, and tailored sizing recommendations.
            </p>
          </div>

          {errorMessage && (
            <div className="login-error-banner">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign-in Area */}
          {GOOGLE_CLIENT_ID && (
            <div className="google-auth-wrap">
              <div ref={googleBtnRef} className="google-btn-slot"></div>
              <div className="auth-separator">
                <span>or sign in with email</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. client@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
              </div>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full login-submit-btn"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="login-footer">
            <p>
              New to Maison Boutique?{' '}
              <Link to={`/register?redirect=${encodeURIComponent(redirectPath)}`} className="auth-link">
                Create Private Client Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
