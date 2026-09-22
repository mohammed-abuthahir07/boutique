import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="container not-found-content">
        <div className="not-found-icon-wrap">
          <Compass size={56} className="not-found-icon" />
        </div>
        <span className="not-found-eyebrow">404 • Page Not Found</span>
        <h1 className="not-found-title">The Silhouette You Seek Has Vanished</h1>
        <p className="not-found-text">
          The boutique creation or private salon URL you requested does not exist or may have been retired into our archival collection.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Return to Atelier Home</span>
          </Link>
          <Link to="/shop" className="btn btn-secondary">
            Explore All Creations
          </Link>
        </div>
      </div>
    </div>
  );
}
