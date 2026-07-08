import React from 'react';
import dayjs from 'dayjs';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { WIN_CONDITIONS } from '../../constants/gameConstants';
import { getChapterProgress } from '../../data/storyChapters';
import { formatRupiah } from '../../utils/formatRupiah';

export default function PanelKalender() {
  const snapshot = useGameStore((s) => s);
  const currentDate = useGameStore((s) => s.currentDate);
  const dayNumber = useGameStore((s) => s.dayNumber);
  const money = useGameStore((s) => s.money);
  const memberCount = useGameStore((s) => s.memberCount);
  const happiness = useGameStore((s) => s.happiness);
  const gagalPanenDay = useGameStore((s) => s.gagalPanenDay);
  const krisisStartDay = useGameStore((s) => s.krisisStartDay);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const { activeChapter, chapters } = getChapterProgress(snapshot);

  const current = dayjs(currentDate);
  const currentMonthIdx = current.month();
  const currentYear = current.year();
  const daysInMonth = current.daysInMonth();
  const firstDayOfMonth = current.startOf('month');
  const startOffset = firstDayOfMonth.day();
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const cells = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({ dayOfMonth: null, cellDayNumber: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDiff = d - current.date();
    const cellDayNumber = dayNumber + dayDiff;
    cells.push({ dayOfMonth: d, cellDayNumber });
  }

  const startDayOfMonth = dayNumber - current.date() + 1;
  const endDayOfMonth = startDayOfMonth + daysInMonth - 1;
  const eventsList = [];

  if (gagalPanenDay >= startDayOfMonth && gagalPanenDay <= endDayOfMonth) {
    const isToday = gagalPanenDay === dayNumber;
    eventsList.push({
      title: `${UI.GAGAL_PANEN} (Tanggal ${gagalPanenDay - startDayOfMonth + 1})`,
      desc: UI.GAGAL_PANEN_DESC,
      status: isToday ? 'SEDANG AKTIF' : 'MENDATANG',
      color: 'var(--accent-orange)',
    });
  }

  if (krisisStartDay >= startDayOfMonth && krisisStartDay <= endDayOfMonth) {
    const krisisEnd = krisisStartDay + 7 - 1;
    const isCurrentlyActive = dayNumber >= krisisStartDay && dayNumber <= krisisEnd;
    eventsList.push({
      title: `${UI.KRISIS_EKONOMI} (Tanggal ${krisisStartDay - startDayOfMonth + 1} - ${krisisEnd - startDayOfMonth + 1})`,
      desc: UI.KRISIS_EKONOMI_DESC,
      status: isCurrentlyActive ? 'SEDANG AKTIF' : 'MENDATANG',
      color: 'var(--accent-red)',
    });
  }

  const targetMoney = WIN_CONDITIONS.MONEY || 10_000_000;
  const targetMembers = WIN_CONDITIONS.MEMBERS || 8;
  const targetHappiness = WIN_CONDITIONS.HAPPINESS || 60;
  const monthProgress = Math.round((current.date() / daysInMonth) * 100);
  const targetCards = [
    { label: 'Kas', value: formatRupiah(money), target: formatRupiah(targetMoney), progress: Math.min(100, Math.round((money / targetMoney) * 100)) },
    { label: 'Anggota', value: memberCount, target: targetMembers, progress: Math.min(100, Math.round((memberCount / targetMembers) * 100)) },
    { label: 'Bahagia', value: `${happiness}%`, target: `${targetHappiness}%`, progress: Math.min(100, Math.round((happiness / targetHappiness) * 100)) },
  ];

  const handleClose = () => {
    setActiveModal(null);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content planner-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="panel-kicker">Buku Kerja Pengurus</span>
            <h2>{UI.KALENDER_ACARA}</h2>
          </div>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        <div className="planner-summary">
          <div>
            <h3>{UI.BULAN_NAMES[currentMonthIdx]} {currentYear}</h3>
            <span>Hari Ke-{dayNumber} dalam tahun</span>
          </div>
          <div className="planner-progress" aria-label={`Bulan berjalan ${monthProgress}%`}>
            <span style={{ width: `${monthProgress}%` }} />
          </div>
        </div>

        <div className="planner-targets">
          {targetCards.map((card) => (
            <div className="planner-target-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>Target {card.target}</small>
              <div className="planner-target-bar">
                <span style={{ width: `${card.progress}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="planner-chapters" aria-label="Kemajuan bab cerita">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className={[
                'planner-chapter',
                chapter.complete ? 'is-complete' : '',
                chapter.id === activeChapter.id ? 'is-active' : '',
              ].filter(Boolean).join(' ')}
            >
              <span>Bab {chapter.number}</span>
              <strong>{chapter.title}</strong>
              <div><i style={{ width: `${chapter.progress}%` }} /></div>
            </div>
          ))}
        </div>

        <div className="planner-body">
          <div>
            <div className="planner-weekdays">
              {daysOfWeek.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="planner-grid">
              {cells.map((cell, idx) => {
                if (!cell.dayOfMonth) {
                  return <div key={`empty-${idx}`} className="planner-day is-empty" />;
                }

                const isToday = cell.cellDayNumber === dayNumber;
                const isGagalPanen = cell.cellDayNumber === gagalPanenDay;
                const isKrisis = krisisStartDay != null && cell.cellDayNumber >= krisisStartDay && cell.cellDayNumber < krisisStartDay + 7;
                const className = [
                  'planner-day',
                  isToday ? 'is-today' : '',
                  isGagalPanen ? 'has-harvest' : '',
                  isKrisis ? 'has-crisis' : '',
                ].filter(Boolean).join(' ');

                return (
                  <div key={cell.dayOfMonth} className={className}>
                    <span>{cell.dayOfMonth}</span>
                    <div className="planner-dots">
                      {isGagalPanen && <span className="dot-harvest" />}
                      {isKrisis && <span className="dot-crisis" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="planner-memo">
            <h3>Memo</h3>
            <p>
              Pantau tanggal rawan dan target akhir tahun. Keputusan harian akan terasa kecil, tapi efeknya menumpuk pada kas, anggota, dan kebahagiaan.
            </p>

            <h4>{UI.ACARA_KHUSUS} Bulan Ini</h4>
            {eventsList.length === 0 ? (
              <div className="planner-empty">Tidak ada acara khusus terjadwal bulan ini.</div>
            ) : (
              <div className="planner-events">
                {eventsList.map((event, idx) => (
                  <div key={idx} className="planner-event" style={{ borderLeftColor: event.color }}>
                    <div>
                      <strong style={{ color: event.color }}>{event.title}</strong>
                      <span>{event.status}</span>
                    </div>
                    <p>{event.desc}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="planner-legend">
              <span><i className="dot-harvest" /> Gagal panen</span>
              <span><i className="dot-crisis" /> Krisis ekonomi</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
