import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import ProductGrid, { ProductGridSkeleton } from '../../components/customer/ProductGrid';
import { useCatalog } from '../../context/CatalogContext';
import CategoryCover from '../../components/customer/CategoryCover';
import OfferPromo from '../../components/customer/OfferPromo';
import collection from '../../assets/collections.png';
import './HomePage.css';

export default function HomePage() {
  const { products, offers, categories, loading, error } = useCatalog();

  // Highlight first 8 products for home page
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="home-page page-enter">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-subheading">Haute Couture & Fine Pret-a-Porter</span>
            <h1 className="hero-heading">Timeless Elegance, Handcrafted in India</h1>
            <p className="hero-description">
              Step into an atelier where ancient handloom heritage converges with modern Parisian silhouettes. Discover luxurious silks, delicate organzas, and regal embellishments.
            </p>
            <div className="hero-buttons">
              <Link to="/shop" className="btn btn-accent btn-lg">
                Shop The Collection <ArrowRight size={18} />
              </Link>
              <Link to="/gallery" className="btn btn-outline-gold btn-lg">
                View Lookbook
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Bar */}
      <section className="pillars-section">
        <div className="container pillars-grid">
          <div className="pillar-item">
            <Sparkles className="pillar-icon" size={24} />
            <div>
              <h4 className="pillar-title">Artisanal Craftsmanship</h4>
              <p className="pillar-desc">Woven by generational master weavers</p>
            </div>
          </div>
          <div className="pillar-item">
            <Truck className="pillar-icon" size={24} />
            <div>
              <h4 className="pillar-title">Insured Express Shipping</h4>
              <p className="pillar-desc">Complimentary across all Indian cities</p>
            </div>
          </div>
          <div className="pillar-item">
            <ShieldCheck className="pillar-icon" size={24} />
            <div>
              <h4 className="pillar-title">Bespoke Fit Guarantee</h4>
              <p className="pillar-desc">Precision tailoring & size assistance</p>
            </div>
          </div>
          <div className="pillar-item">
            <RefreshCw className="pillar-icon" size={24} />
            <div>
              <h4 className="pillar-title">Atelier Consultation</h4>
              <p className="pillar-desc">Personalized styling by appointment</p>
            </div>
          </div>
        </div>
      </section>

      {offers.length > 0 && <OfferPromo offers={offers} />}

      {/* Curated Categories Section */}
      {categories.length > 0 && (
        <section className="categories-section">
          <div className="container">
            <div className="section-title-wrap">
              <span className="section-subtitle">Refined Silhouettes</span>
              <h2 className="section-title">Explore by Category</h2>
              <div className="gold-divider-center"></div>
            </div>

            <div className="categories-grid">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${encodeURIComponent(cat.id)}`}
                  className="category-tile"
                >
                  <CategoryCover category={cat} alt={cat.name} />
                  <div className="category-tile-overlay"></div>
                  <div className="category-tile-content">
                    <span className="cat-count">Atelier Curations</span>
                    <h3 className="category-tile-title">{cat.name}</h3>
                    <span className="category-tile-cta">
                      Explore Collection <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-subtitle">Curated Highlights</span>
            <h2 className="section-title">Featured Creations</h2>
            <div className="gold-divider-center"></div>
            <p className="section-desc">
              Each piece represents an exquisite symphony of fine silks, delicate embroidery, and structured tailoring.
            </p>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <div className="home-error-box">
              <p>{error}</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <ProductGrid products={featuredProducts} />
              <div className="view-all-wrap">
                <Link to="/shop" className="btn btn-outline-gold btn-lg">
                  View Full Collection ({products.length} Designs) <ArrowRight size={16} />
                </Link>
              </div>
            </>
          ) : (
            <div className="home-empty-products">
              <p>New couture pieces are currently being cataloged. Please visit our shop shortly.</p>
              <Link to="/shop" className="btn btn-accent btn-sm">Visit Shop</Link>
            </div>
          )}
        </div>
      </section>

      {/* Brand & Story Section */}
      <section className="brand-story-section">
        <div className="container brand-story-grid">
          <div className="brand-story-image-wrap">
            <img
              src={collection}
              alt="Artisans at work in Maison atelier"
              className="brand-story-img"
            />
            <div className="brand-story-badge">
              <span className="badge-num">100%</span>
              <span className="badge-lbl">Handcrafted Textiles</span>
            </div>
          </div>

          <div className="brand-story-content">
            <span className="section-subtitle">Our Heritage & Craft</span>
            <h2 className="section-title">The Maison Philosophy</h2>
            <div className="gold-divider"></div>
            <p className="story-lead">
              Founded on the pillars of bespoke tailoring, rare textiles, and ethical craftsmanship, Maison Boutique celebrates the slow fashion movement.
            </p>
            <p className="story-p">
              We collaborate directly with generational weavers across Banaras, Chanderi, and Kanchipuram to create garments that transcend fleeting trends. Every seam is finished with couture precision, ensuring an impeccable drape that honors the wearer.
            </p>
            <div className="story-metrics">
              <div className="metric-item">
                <span className="metric-val">40+</span>
                <span className="metric-lbl">Generational Weavers</span>
              </div>
              <div className="metric-item">
                <span className="metric-val">100%</span>
                <span className="metric-lbl">Pure Mulberry Silks</span>
              </div>
              <div className="metric-item">
                <span className="metric-val">Zero</span>
                <span className="metric-lbl">Mass Production</span>
              </div>
            </div>
            <Link to="/about" className="btn btn-primary">
              Learn More About Our Craft <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Lookbook Gallery Teaser */}
      <section className="lookbook-teaser-section">
        <div className="container">
          <div className="lookbook-teaser-card">
            <div className="lookbook-text">
              <span className="lookbook-eyebrow">The Editorial Lookbook</span>
              <h2 className="lookbook-heading">The Royal Bengal & Royal Mughal Series</h2>
              <p className="lookbook-desc">
                Immerse yourself in our cinematic photography lookbook capturing rich jewel tones, opulent brocades, and modern bridal silhouettes.
              </p>
              <Link to="/gallery" className="btn btn-accent">
                View Editorial Gallery <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Atelier Contact / Concierge Section */}
      <section className="concierge-section">
        <div className="container concierge-inner">
          <div className="concierge-text">
            <h3 className="concierge-title">Need Personalized Styling Guidance?</h3>
            <p className="concierge-desc">
              Our master stylists and concierge are at your service for sizing recommendations, bridal styling, or custom fittings.
            </p>
          </div>
          <div className="concierge-actions">
            <Link to="/contact" className="btn btn-primary">
              Contact Concierge
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
