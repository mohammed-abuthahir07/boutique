import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './ContactPage.css';

export default function ContactPage() {
  const { success } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Bespoke Inquiry',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    success('Thank you for contacting Maison Concierge. We will reply within 24 hours.');
  };

  return (
    <div className="contact-page">
      <Breadcrumbs items={[{ label: 'Concierge & Atelier' }]} />

      <div className="contact-header">
        <div className="container">
          <span className="section-subtitle">Personalized Concierge</span>
          <h1 className="contact-title">Contact Our Atelier</h1>
          <p className="contact-subtitle">
            Whether inquiring about bridal bespoke commissions, sizing guidance, or international deliveries, our stylists are at your disposal.
          </p>
        </div>
      </div>

      <div className="container contact-container">
        <div className="contact-grid">
          {/* Atelier Info Column */}
          <div className="contact-info-col">
            <div className="card atelier-info-card">
              <h3 className="card-title-sm">Flagship Atelier</h3>
              <div className="gold-divider"></div>

              <div className="contact-block">
                <MapPin size={20} className="contact-block-icon" />
                <div>
                  <h4>Atelier Address</h4>
                  <p>42 Heritage Boulevard, Colaba Causeway, Mumbai, Maharashtra 400001</p>
                </div>
              </div>

              <div className="contact-block">
                <Phone size={20} className="contact-block-icon" />
                <div>
                  <h4>Direct Telephony</h4>
                  <p>+91 (0) 22 2845 9000</p>
                  <p>+91 98200 12345 (Concierge WhatsApp)</p>
                </div>
              </div>

              <div className="contact-block">
                <Mail size={20} className="contact-block-icon" />
                <div>
                  <h4>Electronic Correspondence</h4>
                  <p>concierge@maisonboutique.in</p>
                  <p>clientrelations@maisonboutique.in</p>
                </div>
              </div>

              <div className="contact-block">
                <Clock size={20} className="contact-block-icon" />
                <div>
                  <h4>Atelier Visiting Hours</h4>
                  <p>Monday – Saturday: 11:00 AM – 8:00 PM IST</p>
                  <p>Sunday: By Private Appointment Only</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form Column */}
          <div className="contact-form-col">
            <div className="card contact-form-card">
              <h3 className="card-title-sm">Dispatch an Inquiry</h3>
              <div className="gold-divider"></div>

              {submitted ? (
                <div className="contact-success-box">
                  <CheckCircle2 size={44} className="text-success" />
                  <h3>Message Dispatched</h3>
                  <p>
                    Thank you, <strong>{formData.name}</strong>. Your inquiry has been routed to our senior client stylist.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-gold btn-sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        subject: 'Bespoke Inquiry',
                        message: '',
                      });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-group">
                    <label htmlFor="contact-name" className="form-label">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Gayatri Sen"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="contact-email" className="form-label">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        className="form-input"
                        placeholder="client@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-phone" className="form-label">
                        Contact Number
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        className="form-input"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-subject" className="form-label">
                      Inquiry Nature
                    </label>
                    <select
                      id="contact-subject"
                      className="form-select"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="Bespoke Inquiry">Bespoke Couture Commission</option>
                      <option value="Bridal Consultation">Bridal Trousseau Consultation</option>
                      <option value="Sizing Help">Garment Sizing & Fit Guidance</option>
                      <option value="Order Status">Existing Order Inquiry</option>
                      <option value="Other">General Inquiries</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message" className="form-label">
                      Message / Special Request *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      className="form-textarea"
                      placeholder="Tell us about the silhouette, occasion date, or specific measurements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg w-full">
                    <Send size={16} /> Transmit Inquiry to Concierge
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
