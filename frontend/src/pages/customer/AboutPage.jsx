import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Award, Users, Heart, ArrowRight } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './AboutPage.css';
import happy from "../../assets/happy.png"
import women2 from "../../assets/women2.png"

export default function AboutPage() {
  return (
    <div className="about-page">
      <Breadcrumbs items={[{ label: 'Our Story & Heritage' }]} />

      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="container about-hero-container">
          <span className="section-subtitle">Heritage & Vision</span>
          <h1 className="about-hero-title">The Art of Slow Couture</h1>
          <p className="about-hero-text">
            Maison Boutique was born from an unyielding passion for artisanal Indian textiles, ancestral craft preservation, and contemporary silhouette engineering.
          </p>
        </div>
      </div>

      {/* Narrative Section */}
      <section className="about-narrative-section">
        <div className="container">
          <div className="narrative-grid">
            <div className="narrative-content">
              <span className="section-subtitle">Our Provenance</span>
              <h2 className="section-title">Bridging Heritage Handlooms with Modern Parisian Aesthetics</h2>
              <div className="gold-divider"></div>
              <p className="narrative-p lead">
                In an era dominated by transient fast fashion, Maison stands as a sanctuary for generational artistry and conscious luxury.
              </p>
              <p className="narrative-p">
                Each silhouette in our collection represents months of collaboration between our studio pattern makers and master weavers in Varanasi, Chanderi, and Jaipur. We source only the purest unadulterated mulberry silks, hand-spun organic cottons, and metallic zari threads.
              </p>
              <p className="narrative-p">
                By investing directly into weaver cooperatives, we ensure that indigenous embroidery techniques—such as zardozi, aari, and dabka—not only survive, but thrive in contemporary world wardrobes.
              </p>
            </div>

            <div className="narrative-images">
              <div className="narrative-img-box img-1">
                <img
                  src= {happy}
                  alt="Atelier artisan embroidery"
                />
              </div>
              <div className="narrative-img-box img-2">
                <img
                  src={women2}
                  alt="Fine silk drape"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Core Values */}
      <section className="about-values-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-subtitle">Guiding Standards</span>
            <h2 className="section-title">Our Atelier Tenets</h2>
            <div className="gold-divider-center"></div>
          </div>

          <div className="values-grid">
            <div className="value-card card">
              <Sparkles className="value-icon" size={28} />
              <h3 className="value-title">Zero Compromise Purity</h3>
              <p className="value-desc">
                From organic dyes to ethically spun mulberry silks, our material standards are uncompromised and environmentally conscious.
              </p>
            </div>

            <div className="value-card card">
              <Award className="value-icon" size={28} />
              <h3 className="value-title">Bespoke Fit Engineering</h3>
              <p className="value-desc">
                Every pattern undergoes rigorous fittings to celebrate the feminine form with poise, effortless movement, and grace.
              </p>
            </div>

            <div className="value-card card">
              <Users className="value-icon" size={28} />
              <h3 className="value-title">Weaver Empowerment</h3>
              <p className="value-desc">
                Direct trade partnerships provide generational weaver clusters with dignified compensation and safe working environments.
              </p>
            </div>

            <div className="value-card card">
              <Heart className="value-icon" size={28} />
              <h3 className="value-title">Heirloom Longevity</h3>
              <p className="value-desc">
                Our garments are structured with generous French seams and linings designed to be treasured across generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Atelier Invitation */}
      <section className="about-cta-section">
        <div className="container about-cta-container">
          <h2>Experience The Craft In Person</h2>
          <p>
            Visit our flagship atelier in Colaba, Mumbai for private consultations, fabric viewings, and bridal appointments.
          </p>
          <div className="about-cta-btns">
            <Link to="/contact" className="btn btn-primary btn-lg">
              Book Atelier Consultation
            </Link>
            <Link to="/shop" className="btn btn-outline-gold btn-lg">
              Explore Collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
