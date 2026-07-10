import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { MUSEUM_TABS, MUSEUM_CONTENT } from '../../data/museumContent';
import { UI } from '../../constants/uiStrings';

export default function PanelMuseum() {
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const [activeTab, setActiveTab] = useState(MUSEUM_TABS[0].id);
  const [activeIdx, setActiveIdx] = useState(0);

  // Reset slide index when changing tabs
  useEffect(() => {
    setActiveIdx(0);
  }, [activeTab]);

  const handleClose = () => {
    setActiveModal(null);
  };

  const content = MUSEUM_CONTENT[activeTab];
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
        className="modal-content glass-card" 
        style={{ 
          maxWidth: '800px', 
          width: '90%', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '0',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Browser-like Window Header & Tabs */}
        <div style={{ background: 'var(--wood-dark)', display: 'flex', flexDirection: 'column' }}>
          {/* Top Window Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '0', background: '#ff5f56' }} onClick={handleClose} cursor="pointer" />
              <div style={{ width: '12px', height: '12px', borderRadius: '0', background: '#ffbd2e' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '0', background: '#27c93f' }} />
            </div>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '600', color: 'var(--ink-inverse)' }}>🏛 {UI.MUSEUM_TITLE || 'Museum Koperasi'}</h2>
            <div style={{ width: '44px' }}></div> {/* Spacer for centering */}
          </div>

          {/* Browser Tabs */}
          <div style={{ display: 'flex', padding: '8px 16px 0 16px', gap: '5px', overflowX: 'auto' }}>
            {MUSEUM_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 20px',
                  background: activeTab === tab.id ? 'var(--paper)' : 'var(--wood-mid)',
                  border: 'none',
                  borderRadius: '0',
                  color: activeTab === tab.id ? 'var(--ink)' : 'var(--ink-inverse)',
                  fontWeight: activeTab === tab.id ? '700' : '500',
                  fontSize: '18px',
                  cursor: 'pointer',
                  borderTop: activeTab === tab.id ? '3px solid var(--accent-green)' : '3px solid transparent',
                  boxShadow: 'none',
                  transition: 'none',
                  outline: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area with Carousel */}
        <div style={{ padding: '31px', background: 'var(--paper)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '31px', fontWeight: '800', marginBottom: '16px', color: 'var(--accent-yellow)', textAlign: 'center' }}>
            {content.title}
          </h1>
          
          <div className="carousel-container" style={{ flex: 1 }}>
            <button className="carousel-arrow" onClick={handlePrev}>&larr;</button>

            <div className="carousel-slide" style={{ padding: '0', background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', gap: '26px' }}>
              {/* Image for the current section */}
              <div style={{ width: '100%', height: '200px', borderRadius: '0', overflow: 'hidden', border: '3px solid var(--wood-dark)' }}>
                <img src={currentSlide.image || content.image} alt={content.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Text for the current section */}
              <div style={{ background: 'var(--paper-2)', padding: '26px', borderRadius: '0', border: '3px solid var(--wood-dark)' }}>
                <h3 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '12px', color: 'var(--accent-green)' }}>
                  {currentSlide.subtitle}
                </h3>
                <p style={{ fontSize: '20px', color: 'var(--ink)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                  {currentSlide.text}
                </p>
              </div>
            </div>

            <button className="carousel-arrow" onClick={handleNext}>&rarr;</button>
          </div>

          {/* Page / Dot Indicators */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '24px' }}>
            <span style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Halaman {activeIdx + 1} dari {numSlides}
            </span>
            <div className="carousel-dots">
              {content.sections.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`carousel-dot ${activeIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(idx)}
                  style={{ width: '10px', height: '10px', margin: '0 6px', cursor: 'pointer' }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
