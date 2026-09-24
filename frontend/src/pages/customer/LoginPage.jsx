import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useToast } from '../../context/ToastContext';
import { GOOGLE_CLIENT_ID } from '../../config/apiConfig';
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {errorMessage && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input auth-input-with-toggle"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="current-password"
                required
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full auth-submit"
          >
            {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={16} />
          </button>
        </form>

        {GOOGLE_CLIENT_ID && (
          <div className="google-auth-wrap">
            <div className="auth-separator">
              <span>or</span>
            </div>
            <div ref={googleBtnRef} className="google-btn-slot"></div>
          </div>
        )}

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirectPath)}`} className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
