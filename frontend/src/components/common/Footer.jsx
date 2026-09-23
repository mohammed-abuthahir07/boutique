import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useToast } from '../../context/ToastContext';
import './Footer.css';

export default function Footer() {
  const { isAuthenticated } = useCustomerAuth();
  const { info } = useToast();
  const navigate = useNavigate();

  const requireSignIn = (event, path) => {
    if (isAuthenticated) return;
    event.preventDefault();
    info('Please sign in to continue');
    navigate(`/login?redirect=${encodeURIComponent(path)}`);
  };
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <span className="logo-main">MAISON</span>
              <span className="logo-sub">BOUTIQUE</span>
            </Link>
            <p className="brand-tagline">
              Curators of fine pret-a-porter, bespoke artisanal silhouettes, and timeless couture. Handcrafted with reverence to heritage textiles and contemporary tailoring.
            </p>
            <div className="social-links">
              <a href="#instagram" aria-label="Instagram" className="social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="#facebook" aria-label="Facebook" className="social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="#twitter" aria-label="Twitter" className="social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Collection</h4>
            <div className="footer-gold-line"></div>
            <ul className="footer-links">
              <li><Link to="/shop">All products</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/shop?sort=featured">Featured</Link></li>
              <li><Link to="/about">About us</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="footer-col">
            <h4 className="footer-heading">Help</h4>
            <div className="footer-gold-line"></div>
            <ul className="footer-links">
              <li><Link to="/profile" onClick={(e) => requireSignIn(e, '/profile')}>Your account</Link></li>
              <li><Link to="/orders" onClick={(e) => requireSignIn(e, '/orders')}>Track order</Link></li>
              <li><Link to="/wishlist" onClick={(e) => requireSignIn(e, '/wishlist')}>Wishlist</Link></li>
              <li><Link to="/cart" onClick={(e) => requireSignIn(e, '/cart')}>Cart</Link></li>
              <li><Link to="/contact">Contact us</Link></li>
            </ul>
          </div>

          {/* Atelier Contact */}
          <div className="footer-col contact-col">
            <h4 className="footer-heading">Get in touch</h4>
            <div className="footer-gold-line"></div>
            <ul className="contact-list">
              <li>
                <MapPin size={16} className="contact-icon" />
                <span>42 Heritage Boulevard, Colaba, Mumbai 400001</span>
              </li>
              <li>
                <Phone size={16} className="contact-icon" />
                <span>+91 (0) 22 2845 9000</span>
              </li>
              <li>
                <Mail size={16} className="contact-icon" />
                <span>concierge@maisonboutique.in</span>
              </li>
            </ul>
            <div className="newsletter-box">
              <p className="newsletter-label">Get offers on email</p>
              <form onSubmit={(e) => e.preventDefault()} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address"
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="copyright">
            &copy; {new Date().getFullYear()} MAISON BOUTIQUE. All Rights Reserved. Exemplary Indian Craftsmanship.
          </p>
          <div className="footer-badges">
            <span>Secure Checkout</span>
            <span>•</span>
            <span>Artisanal Handloom</span>
            <span>•</span>
            <span>Complimentary Insured Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
