import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

const STORY_BEATS = [
  {
    speaker: 'Narator Desa',
    title: 'Koperasi di Persimpangan',
    text: 'Di sebuah desa yang sedang tumbuh, koperasi menjadi tempat warga berharap harga tetap adil dan usaha kecil tetap hidup.',
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
  const isLast = index === STORY_BEATS.length - 1;

  const handleNext = () => {
    if (isLast) {
      completeStoryIntro();
      return;
    }
    setIndex((current) => current + 1);
  };

  return (
    <div className="story-overlay" role="dialog" aria-modal="true" aria-labelledby="story-title">
      <div className="story-scene">
        <div className="story-art" aria-hidden="true">
          {beat.avatar ? (
            <img src={beat.avatar} alt="" />
          ) : (
            <div className="story-village-mark">KMP</div>
          )}
        </div>

        <div className="story-dialog">
          <span className="story-speaker">{beat.speaker}</span>
          <h1 id="story-title">{beat.title}</h1>
          <p>{beat.text}</p>
          <div className="story-actions">
            <button className="btn btn-secondary" onClick={completeStoryIntro}>
              Lewati
            </button>
            <button className="btn btn-primary" onClick={handleNext}>
              {isLast ? 'Mulai Mengelola' : 'Lanjut'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
