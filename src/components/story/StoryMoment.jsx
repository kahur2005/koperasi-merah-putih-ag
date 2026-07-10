import React from 'react';
import { useGameStore } from '../../store/gameStore';

export default function StoryMoment() {
  const currentStoryMoment = useGameStore((state) => state.currentStoryMoment);
  const dismissStoryMoment = useGameStore((state) => state.dismissStoryMoment);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const setView = useGameStore((state) => state.setView);
  const startManagerMode = useGameStore((state) => state.startManagerMode);

  if (!currentStoryMoment) return null;

  const handleAction = () => {
    if (currentStoryMoment.actionView) {
      setView(currentStoryMoment.actionView);
    }
    if (currentStoryMoment.actionModal) {
      setActiveModal(currentStoryMoment.actionModal);
    }
    if (currentStoryMoment.actionEvent === 'startManagerMode') {
      startManagerMode();
    }
    dismissStoryMoment();
  };

  return (
    <div className="story-moment-overlay" role="dialog" aria-modal="true" aria-labelledby="story-moment-title">
      <article className={`story-moment ${currentStoryMoment.tone || 'normal'}`}>
        <div className="story-moment-portrait">
          {currentStoryMoment.avatar ? (
            <img src={currentStoryMoment.avatar} alt="" />
          ) : (
            <span>KMP</span>
          )}
        </div>

        <div className="story-moment-body">
          <span className="story-speaker">{currentStoryMoment.speaker}</span>
          <h2 id="story-moment-title">{currentStoryMoment.title}</h2>
          <p>{currentStoryMoment.text}</p>

          <div className="story-actions">
            <button className="btn btn-secondary" onClick={dismissStoryMoment}>
              Nanti
            </button>
            {(currentStoryMoment.actionLabel || currentStoryMoment.actionModal || currentStoryMoment.actionView || currentStoryMoment.actionEvent) && (
              <button className="btn btn-primary" onClick={handleAction}>
                {currentStoryMoment.actionLabel || 'Lanjut'}
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
