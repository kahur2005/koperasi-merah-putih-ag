import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getPrimaryActionLabel, getStoryTransition } from './introFlow';

const STORY_BEATS = [
  {
    speaker: 'Narator Desa',
    title: 'Koperasi di Persimpangan',
    text: 'Di sebuah desa yang sedang tumbuh, koperasi menjadi tempat warga berharap harga tetap adil dan usaha kecil tetap hidup.',
    avatar: '/assets/images/ui/intro_narrator.png',
  },
  {
    speaker: 'Bu Siti',
    title: 'Suara UMKM',
    text: 'Kalau stok koperasi kosong, warga kembali ke ritel besar. Kalau harga terlalu tinggi, anggota mulai kehilangan percaya.',
    avatar: '/assets/avatars/female_1_siti.jpg',
  },
  {
    speaker: 'Pak Budi',
    title: 'Tugas Pengurus Baru',
    text: 'Kelola pasokan, bantu anggota, atur harga, dan bangun toko yang bisa membuat desa bergerak bersama.',
    avatar: '/assets/avatars/male_1_budi.jpg',
  },
];

export default function StoryIntro() {
  const [index, setIndex] = useState(0);
  const completeStoryIntro = useGameStore((s) => s.completeStoryIntro);
  const beat = STORY_BEATS[index];
  const primaryActionLabel = getPrimaryActionLabel(index, STORY_BEATS.length);

  const handleNext = () => {
    const transition = getStoryTransition(index, STORY_BEATS.length);

    if (transition.type === 'complete') {
      completeStoryIntro();
      return;
    }

    setIndex(transition.index);
  };

  const handleSkip = () => {
    const transition = getStoryTransition(index, STORY_BEATS.length, { skip: true });

    if (transition.type === 'complete') {
      completeStoryIntro();
    }
  };

  return (
    <div className="story-overlay" role="dialog" aria-modal="true" aria-labelledby="story-title">
      <div className="story-intro-scene">
        <img
          className="story-intro-background"
          src="/assets/images/ui/intro_village_bg.png"
          alt=""
          aria-hidden="true"
        />

        <div className="story-ledger">
          <div className="story-portrait-frame">
            <img className="story-portrait" src={beat.avatar} alt="" />
          </div>

          <div className="story-ledger-content">
            <span className="story-speaker-tab">{beat.speaker}</span>
            <div className="story-copy">
              <h1 id="story-title" className="story-title">{beat.title}</h1>
              <p className="story-text">{beat.text}</p>
            </div>
          </div>

          <div className="story-actions">
            <button className="btn btn-primary story-action-primary" onClick={handleNext}>
              {primaryActionLabel}
            </button>
            <button className="btn btn-secondary story-action-skip" onClick={handleSkip}>
              Lewati
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
