import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export default function PhaseTransition() {
  const phaseTransition = useGameStore((s) => s.phaseTransition);
  const clearPhaseTransition = useGameStore((s) => s.clearPhaseTransition);

  const [active, setActive] = useState(false);
  const [bgVisible, setBgVisible] = useState(false);

  useEffect(() => {
    if (phaseTransition) {
      // 0.0s: Clouds slide in to cover screen
      setActive(true);
      
      // 1.0s: Clouds fully closed. Show text behind clouds and update game UI.
      const midTimer = setTimeout(() => {
        setBgVisible(true);
        if (phaseTransition.onMiddleAction) {
          phaseTransition.onMiddleAction();
        }
      }, 1000);

      // 1.5s: Clouds slide apart, revealing the text
      const openTimer = setTimeout(() => {
        setActive(false);
      }, 1500);

      // 4.0s: Text fades out
      const fadeTimer = setTimeout(() => {
        setBgVisible(false);
      }, 4000);

      // 4.5s: Finish and unmount
      const endTimer = setTimeout(() => {
        clearPhaseTransition();
      }, 4500);

      return () => {
        clearTimeout(midTimer);
        clearTimeout(openTimer);
        clearTimeout(fadeTimer);
        clearTimeout(endTimer);
      };
    }
  }, [phaseTransition, clearPhaseTransition]);

  if (!phaseTransition) return null;

  return (
    <div className="phase-transition-overlay">
      <div className={`phase-transition-bg ${bgVisible ? 'visible' : ''}`}>
        <span className="phase-transition-text">{phaseTransition.text}</span>
      </div>
      <div className={`cloud-left ${active ? 'active' : ''}`} />
      <div className={`cloud-right ${active ? 'active' : ''}`} />
    </div>
  );
}
