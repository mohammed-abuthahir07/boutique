import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({
  title = 'No creations found',
  description = 'Our atelier is continually crafting new silhouettes. Please explore our other curated selections.',
  icon: Icon = Sparkles,
  actionText = 'Explore Shop',
  actionLink = '/shop',
  onActionClick = null,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrap">
        <Icon size={32} className="empty-icon" />
      </div>
      <h3 className="empty-title">{title}</h3>
      <div className="empty-gold-line"></div>
      <p className="empty-description">{description}</p>
      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn btn-accent btn-sm">
            {actionText}
          </Link>
        ) : (
          <button type="button" onClick={onActionClick} className="btn btn-accent btn-sm">
            {actionText}
          </button>
        )
      )}
    </div>
  );
}
