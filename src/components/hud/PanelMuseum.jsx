import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { MUSEUM_CONTENT } from '../../data/museumContent';
import { UI } from '../../constants/uiStrings';

export default function PanelMuseum() {
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleClose = () => {
    setActiveModal(null);
  };

  const content = MUSEUM_CONTENT['history'];
  const numSlides = content.sections.length;

  const handlePrev = () => {
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : numSlides - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev < numSlides - 1 ? prev + 1 : 0));
  };

  const currentSlide = content.sections[activeIdx];

  return (
    <div className="modal-overlay" onClick={handleClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content glass-card modal-wide" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '900px', width: '95%', maxHeight: '95vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <h2 style={{ letterSpacing: '2px' }}>{UI.MUSEUM_TITLE || 'Museum Koperasi'}</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '12px' }}>
          
          {/* Carousel Navigation Top */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={handlePrev} style={{ padding: '8px 16px' }}>&larr; Prev</button>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-yellow)', margin: 0, textAlign: 'center' }}>
              {currentSlide.subtitle}
            </h3>
            <button className="btn btn-primary" onClick={handleNext} style={{ padding: '8px 16px' }}>Next &rarr;</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
            {/* Image */}
            <div style={{ width: '100%', maxWidth: '700px', height: '350px', borderRadius: '8px', overflow: 'hidden', border: '4px solid var(--wood-dark)', flexShrink: 0 }}>
              <img src={currentSlide.image} alt={currentSlide.subtitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Text description */}
            <div style={{ width: '100%', maxWidth: '700px', background: 'var(--paper-2)', padding: '24px', borderRadius: '8px', border: '3px solid var(--wood-dark)' }}>
              <p style={{ fontSize: '20px', color: 'var(--ink)', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                {currentSlide.text}
              </p>
            </div>
          </div>

          {/* Page Indicators */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Halaman {activeIdx + 1} dari {numSlides}
            </span>
            <div className="carousel-dots" style={{ display: 'flex' }}>
              {content.sections.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`carousel-dot ${activeIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(idx)}
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    margin: '0 6px', 
                    cursor: 'pointer', 
                    borderRadius: '50%', 
                    background: activeIdx === idx ? 'var(--accent-green)' : 'var(--wood-dark)' 
                  }}
                ></div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
