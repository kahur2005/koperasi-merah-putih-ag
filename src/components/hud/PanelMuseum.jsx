import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { MUSEUM_TIMELINE } from '../../data/museumContent';
import { UI } from '../../constants/uiStrings';

export default function PanelMuseum() {
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleClose = () => {
    setActiveModal(null);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : MUSEUM_TIMELINE.length - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev < MUSEUM_TIMELINE.length - 1 ? prev + 1 : 0));
  };

  const currentSlide = MUSEUM_TIMELINE[activeIdx];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass-card" style={{ maxWidth: '580px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏛 {UI.MUSEUM_TITLE}</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        {/* Carousel slide area */}
        <div className="carousel-container">
          <button className="carousel-arrow" onClick={handlePrev}>&larr;</button>

          <div className="carousel-slide" style={{ padding: '16px', background: 'rgba(15,23,42,0.4)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ fontSize: '26px', fontWeight: '800', color: 'var(--accent-red)', display: 'block', marginBottom: '8px' }}>
              📅 {currentSlide.year}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
              {currentSlide.title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', minHeight: '80px' }}>
              {currentSlide.description}
            </p>
          </div>

          <button className="carousel-arrow" onClick={handleNext}>&rarr;</button>
        </div>

        {/* Page / Dot Indicators */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {UI.HALAMAN} {activeIdx + 1} {UI.DARI} {MUSEUM_TIMELINE.length}
          </span>
          <div className="carousel-dots">
            {MUSEUM_TIMELINE.map((_, idx) => (
              <div 
                key={idx} 
                className={`carousel-dot ${activeIdx === idx ? 'active' : ''}`}
                onClick={() => setActiveIdx(idx)}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
