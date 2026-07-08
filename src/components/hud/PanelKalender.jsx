import React from 'react';
import dayjs from 'dayjs';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';

export default function PanelKalender() {
  const currentDate = useGameStore((s) => s.currentDate);
  const dayNumber = useGameStore((s) => s.dayNumber);
  const activeEvents = useGameStore((s) => s.activeEvents);
  const gagalPanenDay = useGameStore((s) => s.gagalPanenDay);
  const krisisStartDay = useGameStore((s) => s.krisisStartDay);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const current = dayjs(currentDate);
  const currentMonthIdx = current.month();
  const currentYear = current.year();
  const daysInMonth = current.daysInMonth();
  const firstDayOfMonth = current.startOf('month');
  const startOffset = firstDayOfMonth.day(); // 0 = Sunday, 1 = Monday, etc.

  const handleClose = () => {
    setActiveModal(null);
  };

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Build calendar cells
  const cells = [];
  // Offset cells
  for (let i = 0; i < startOffset; i++) {
    cells.push({ dayOfMonth: null, cellDayNumber: null });
  }
  // Days of month cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDiff = d - current.date();
    const cellDayNumber = dayNumber + dayDiff;
    cells.push({ dayOfMonth: d, cellDayNumber });
  }

  // Get active events or upcoming event descriptions
  const eventsList = [];
  const startDayOfMonth = dayNumber - current.date() + 1;
  const endDayOfMonth = startDayOfMonth + daysInMonth - 1;

  if (gagalPanenDay >= startDayOfMonth && gagalPanenDay <= endDayOfMonth) {
    const isToday = gagalPanenDay === dayNumber;
    eventsList.push({
      type: 'gagal_panen',
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
      type: 'krisis',
      title: `${UI.KRISIS_EKONOMI} (Tanggal ${krisisStartDay - startDayOfMonth + 1} - ${krisisEnd - startDayOfMonth + 1})`,
      desc: UI.KRISIS_EKONOMI_DESC,
      status: isCurrentlyActive ? 'SEDANG AKTIF' : 'MENDATANG',
      color: 'var(--accent-red)',
    });
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{UI.KALENDER_ACARA}</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        {/* Month Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
            {UI.BULAN_NAMES[currentMonthIdx]} {currentYear}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Hari Ke-{dayNumber} dalam tahun
          </span>
        </div>

        {/* Days of Week Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: '700', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontSize: '14px', marginBottom: '24px' }}>
          {cells.map((cell, idx) => {
            const { dayOfMonth, cellDayNumber } = cell;

            if (!dayOfMonth) {
              return <div key={`empty-${idx}`} style={{ height: '36px' }}></div>;
            }

            const isToday = cellDayNumber === dayNumber;
            const isGagalPanen = cellDayNumber === gagalPanenDay;
            const isKrisis = cellDayNumber >= krisisStartDay && cellDayNumber < krisisStartDay + 7;

            // Highlight border if active or target day
            let cellStyle = {
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              position: 'relative',
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid transparent',
              fontWeight: '500',
            };

            if (isToday) {
              cellStyle.border = '2px solid var(--accent-blue)';
              cellStyle.fontWeight = '700';
              cellStyle.background = 'rgba(59, 130, 246, 0.2)';
            }

            return (
              <div key={dayOfMonth} style={cellStyle}>
                {dayOfMonth}
                {/* Event indicators (dots) */}
                <div style={{ position: 'absolute', bottom: '2px', display: 'flex', gap: '2px' }}>
                  {isGagalPanen && (
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-orange)' }}></div>
                  )}
                  {isKrisis && (
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-red)' }}></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Events List */}
        <div>
          <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
            {UI.ACARA_KHUSUS} Bulan Ini
          </h4>
          {eventsList.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px' }}>
              Tidak ada acara khusus terjadwal bulan ini.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {eventsList.map((ev, idx) => (
                <div key={idx} style={{ padding: '10px', background: 'rgba(15,23,42,0.3)', borderRadius: '8px', borderLeft: `3px solid ${ev.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: ev.color }}>{ev.title}</span>
                    <span style={{ fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)' }}>{ev.status}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{ev.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
