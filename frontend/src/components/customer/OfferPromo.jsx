import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import { formatOfferLabel } from '../../utils/format';
import './OfferPromo.css';

function useCountdown(endDate) {
  const [left, setLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0, ended: false });

  useEffect(() => {
    if (!endDate) return undefined;
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setLeft({ days: 0, hours: 0, mins: 0, secs: 0, ended: true });
        return;
      }
      setLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        mins: Math.floor((diff / 60000) % 60),
        secs: Math.floor((diff / 1000) % 60),
        ended: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return left;
}

function OfferSlide({ offer }) {
  const countdown = useCountdown(offer.end_date);
  const label = formatOfferLabel(offer);
  const ends = offer.end_date
    ? new Date(offer.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';

  return (
    <div className="offer-ad">
      <div className="offer-ad-shine" aria-hidden="true" />
      <div className="offer-ad-left">
        <span className="offer-ad-kicker">
          <Sparkles size={14} /> Limited time deal
        </span>
        <p className="offer-ad-discount">{label}</p>
        <p className="offer-ad-hint">On selected styles</p>
      </div>
      <div className="offer-ad-right">
        <h3 className="offer-ad-title">{offer.title}</h3>
        {offer.description && <p className="offer-ad-desc">{offer.description}</p>}
        {!countdown.ended && offer.end_date && (
          <div className="offer-ad-timer" aria-label="Offer ends in">
            <Clock size={14} />
            <span>Ends in</span>
            <strong>{String(countdown.days).padStart(2, '0')}</strong>d
            <strong>{String(countdown.hours).padStart(2, '0')}</strong>h
            <strong>{String(countdown.mins).padStart(2, '0')}</strong>m
            <strong>{String(countdown.secs).padStart(2, '0')}</strong>s
          </div>
        )}
        <div className="offer-ad-actions">
          <Link to="/shop" className="offer-ad-cta">
            Shop this deal <ArrowRight size={16} />
          </Link>
          {ends && <span className="offer-ad-valid">Valid till {ends}</span>}
        </div>
      </div>
    </div>
  );
}

export default function OfferPromo({ offers = [] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (offers.length < 2) return undefined;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % offers.length);
    }, 5500);
    return () => clearInterval(id);
  }, [offers.length]);

  if (!offers.length) return null;

  return (
    <section className="offer-promo-section" aria-label="Current offers">
      <div className="container">
        <div className="offer-promo-head">
          <h2>Today’s deals</h2>
          <p>Fresh discounts from the boutique — tap to shop.</p>
        </div>

        <OfferSlide offer={offers[active]} />

        {offers.length > 1 && (
          <div className="offer-promo-dots" role="tablist" aria-label="Offer slides">
            {offers.map((offer, index) => (
              <button
                key={offer.id || index}
                type="button"
                className={index === active ? 'active' : ''}
                onClick={() => setActive(index)}
                aria-label={`Show offer ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
