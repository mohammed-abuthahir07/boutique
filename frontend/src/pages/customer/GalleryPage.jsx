import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Sparkles } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Modal from '../../components/common/Modal';
import './GalleryPage.css';
import madurai from '../../assets/madurai.png';
import kanchipuram from '../../assets/kanchipuram.png';
import karaikudi from '../../assets/karaikudi.png'
import temple from '../../assets/temple.png'

const LOOKBOOK_ITEMS = [
  {
    id: 1,
    title: 'Kanchipuram Pure Silk Zari Kanjivaram',
    collection: 'Pongal Heirloom 2026',
    image: kanchipuram,
    description: 'Handwoven deep crimson Kanchipuram silk saree with intricate gold zari temple borders (Korvai weave) and traditional peacock motifs.',
  },
  {
    id: 2,
    title: 'Madurai Sungudi Cotton Saree',
    collection: 'Aadi Traditions',
    image: "https://studiovirupa.com/cdn/shop/files/78D52767-88FD-4A78-A5DF-DA015C94AF06_1024x1024.jpg?v=1771586779",
    description: 'Breathable pure Madurai Sungudi cotton saree featuring authentic tie-dye dot patterns and a contrasting zari border.',
  },
  {
    id: 3,
    title: 'Chettinad Handloom Cotton Saree',
    collection: 'Heritage Karaikudi',
    image: "https://thenmozhidesigns.com/cdn/shop/files/352A0429.jpg?v=1758159106&width=2048",
    description: 'Traditional heavy Chettinad cotton weave styled with bold check patterns, vivid temple borders, and structured drape.',
  },
  {
    id: 4,
    title: 'Temple Border Silk Pattu Pavadai',
    collection: 'Margazhi Festivities',
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_6d4P0usq0A2Ian0a4Mzutmn96HdUpxYzJAXvepp47QQPBSGWrJAvlM&s=10",
    description: 'Classic pure silk Pattu Pavadai set for young women, featuring rich mango boutis, contrasting zari border, and matching blouse.',
  },
  {
    id: 5,
    title: 'Traditional Pure Silk Veshti & Angavastram',
    collection: 'Bespoke Muhurtham',
    image: 'https://sethukrishna.com/cdn/shop/products/Mynthra_06_c6b78e9e-bab3-49e3-85c6-27a51405c24f.jpg?v=1679396319&width=900',
    description: 'Handcrafted pure Kanchi silk white Veshti with thick Mayilkan gold zari borders paired with a matching embroidered Angavastram.',
  },
  {
    id: 6,
    title: 'Coimbatore Soft Silk Dhavani Set',
    collection: 'Kongu Bridal & Half-Saree',
    image: 'https://mymaharani.com/wp-content/uploads/2024/09/WhatsApp-Image-2024-08-14-at-11.37.38-AM-scaled.jpeg',
    description: 'Vibrant silk Half-Saree (Langa Voni) with a pleated Coimbatore soft-silk skirt, fine zardozi blouse, and delicate organza dupatta.',
  },
];

export default function GalleryPage() {
  const [activeItem, setActiveItem] = useState(null);

  return (
    <div className="gallery-page">
      <Breadcrumbs items={[{ label: 'Editorial Lookbook' }]} />

      <div className="gallery-header">
        <div className="container">
          <span className="section-subtitle">Editorial Photography</span>
          <h1 className="gallery-title">The Maison Lookbook</h1>
          <p className="gallery-subtitle">
            A visual documentation of our seasonal collections, capturing fluid drapes, heritage embroideries, and sculptural tailoring.
          </p>
        </div>
      </div>

      <div className="container gallery-container">
        <div className="lookbook-masonry">
          {LOOKBOOK_ITEMS.map((item) => (
            <div
              key={item.id}
              className="lookbook-card"
              onClick={() => setActiveItem(item)}
            >
              <img src={item.image} alt={item.title} className="lookbook-img" />
              <div className="lookbook-overlay">
                <span className="lookbook-coll">{item.collection}</span>
                <h3 className="lookbook-item-title">{item.title}</h3>
                <span className="lookbook-preview-btn">
                  <Eye size={15} /> Examine Silhouette
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="gallery-footer-cta">
          <Sparkles className="text-gold" size={24} />
          <h3>Inspired by Our Lookbook?</h3>
          <p>Explore current pieces available in our ready-to-wear shop or schedule a bespoke fitting.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Shop Available Pieces <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Detail Modal */}
      {activeItem && (
        <Modal
          isOpen={Boolean(activeItem)}
          onClose={() => setActiveItem(null)}
          title={activeItem.title}
          maxWidth="640px"
        >
          <div className="lookbook-modal-body">
            <img
              src={activeItem.image}
              alt={activeItem.title}
              className="modal-lookbook-img"
            />
            <span className="modal-coll-tag">{activeItem.collection}</span>
            <p className="modal-desc">{activeItem.description}</p>
            <div className="modal-actions">
              <Link to="/shop" className="btn btn-accent btn-sm">
                Shop Similar Pieces
              </Link>
              <Link to="/contact" className="btn btn-outline btn-sm">
                Inquire With Atelier
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
