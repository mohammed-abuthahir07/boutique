import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import publicService from '../../services/publicService';
import Loader from '../../components/common/Loader';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './CategoriesPage.css';

const CATEGORY_IMAGES = [
  'https://www.shoplibas.com/cdn/shop/files/358990H_Main_f119bc83-29b2-4bda-829a-6f500e9c93bc.jpg?v=1781584298&width=1080',
  'https://sudathi.com/cdn/shop/files/Deepika_Singh_X_Sudathi_1.jpg?v=1783661480&width=1500',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        setLoading(true);
        const res = await publicService.getProducts();
        if (isMounted) {
          if (res.success && Array.isArray(res.products)) {
            const map = new Map();
            res.products.forEach((p) => {
              if (p.category_id && p.category_name) {
                const existing = map.get(String(p.category_id));
                if (existing) {
                  existing.count += 1;
                } else {
                  map.set(String(p.category_id), {
                    id: p.category_id,
                    name: p.category_name,
                    count: 1,
                  });
                }
              }
            });
            setCategories(Array.from(map.values()));
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load categories');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="categories-page">
      <Breadcrumbs items={[{ label: 'Categories' }]} />

      <div className="categories-header">
        <div className="container">
          <span className="section-subtitle">Artisanal Classification</span>
          <h1 className="categories-title">Curated Categories</h1>
          <p className="categories-subtitle">
            Explore our collections grouped by aesthetic silhouette, fabric weight, and occasion.
          </p>
        </div>
      </div>

      <div className="container categories-main">
        {loading ? (
          <Loader message="Organizing categories..." />
        ) : error ? (
          <div className="cat-error-box">
            <p>{error}</p>
          </div>
        ) : categories.length > 0 ? (
          <div className="categories-grid-cards">
            {categories.map((cat, index) => {
              const bgImg = CATEGORY_IMAGES[index % CATEGORY_IMAGES.length];
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${encodeURIComponent(cat.id)}`}
                  className="cat-card"
                  style={{ backgroundImage: `url(${bgImg})` }}
                >
                  <div className="cat-card-overlay"></div>
                  <div className="cat-card-content">
                    <span className="cat-piece-count">{cat.count} Available Creation{cat.count > 1 ? 's' : ''}</span>
                    <h3 className="cat-card-name">{cat.name}</h3>
                    <span className="cat-card-btn">
                      Shop Category <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="no-cat-state">
            <Sparkles size={32} className="text-gold" />
            <h3>No categories available</h3>
            <p>Our curations are being updated. View all pieces in the shop.</p>
            <Link to="/shop" className="btn btn-accent btn-sm">
              Go to Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
