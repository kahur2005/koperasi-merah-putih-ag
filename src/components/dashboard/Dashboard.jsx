import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { formatRupiah } from '../../utils/formatRupiah';
import TopBar from '../hud/TopBar';
import PanelAnggota from '../hud/PanelAnggota';
import PanelPinjaman from '../hud/PanelPinjaman';
import PasarPasokan from '../hud/PasarPasokan';
import KontrolHarga from '../hud/KontrolHarga';
import PanelKalender from '../hud/PanelKalender';
import LaporanHarian from '../hud/LaporanHarian';
import BagiHasil from '../hud/BagiHasil';
import PanelMuseum from '../hud/PanelMuseum';
import dayjs from 'dayjs';

export default function Dashboard() {
  const dayNumber = useGameStore((s) => s.dayNumber);
  const currentDate = useGameStore((s) => s.currentDate);
  const activeModal = useGameStore((s) => s.activeModal);
  const pendingApplications = useGameStore((s) => s.pendingApplications);
  const pendingLoanRequests = useGameStore((s) => s.pendingLoanRequests);
  const activeEvents = useGameStore((s) => s.activeEvents);
  const setView = useGameStore((s) => s.setView);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setSelectedNpc = useGameStore((s) => s.setSelectedNpc);
  const setSelectedLoan = useGameStore((s) => s.setSelectedLoan);
  const endDay = useGameStore((s) => s.endDay);
  const resetGame = useGameStore((s) => s.resetGame);
  const gameResult = useGameStore((s) => s.gameResult);
  const activeLoans = useGameStore((s) => s.activeLoans);

  const dateObj = dayjs(currentDate);
  const monthName = UI.BULAN_NAMES[dateObj.month()];
  const displayDateStr = `${dateObj.date()} ${monthName} ${dateObj.year()}`;

  const handleSelectNpc = (npc) => {
    setSelectedNpc(npc);
    setActiveModal('anggotaDetail');
  };

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    setActiveModal('pinjamanDetail');
  };

  return (
    <div 
      className="dashboard" 
      style={{ 
        background: 'url(/assets/textures/dashboard_bg.png) no-repeat center center / cover, radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Top HUD */}
      <TopBar />

      {/* Event Warnings */}
      <div className="event-banners">
        {activeEvents.map((evt, idx) => {
          if (evt.type === 'gagalPanen') {
            return (
              <div key={idx} className="event-banner warning">
                🌾 <span><strong>{UI.GAGAL_PANEN}:</strong> {UI.GAGAL_PANEN_DESC}</span>
              </div>
            );
          }
          if (evt.type === 'krisisEkonomi') {
            return (
              <div key={idx} className="event-banner danger">
                ⚠️ <span><strong>{UI.KRISIS_EKONOMI}:</strong> {UI.KRISIS_EKONOMI_DESC}</span>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        <button className="sidebar-btn" onClick={() => setActiveModal('museum')}>
          <span className="emoji">🏛</span>
          <span>{UI.MUSEUM}</span>
        </button>
        <button className="sidebar-btn" onClick={() => setActiveModal('pasar')}>
          <span className="emoji">🛒</span>
          <span>{UI.PASAR}</span>
        </button>
        <button className="sidebar-btn" onClick={() => setActiveModal('harga')}>
          <span className="emoji">
            <img src="/assets/images/icon_uang.png" alt="Harga" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          </span>
          <span>{UI.HARGA}</span>
        </button>
      </div>

      {/* Center Building Graphic */}
      <div className="center-building-area">
        <button className="btn btn-primary btn-masuk" onClick={() => setView('store3d')}>
          🚪 {UI.MASUK}
        </button>
      </div>

      {/* Date Display */}
      <div style={{ position: 'fixed', bottom: '150px', left: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>
        Hari Ke-{dayNumber} &bull; <span style={{ color: 'var(--text-primary)' }}>{displayDateStr}</span>
      </div>

      {/* Bottom Bar Controls */}
      <div className="bottom-bar glass-card">
        {/* Section 1: Loans */}
        <div className="bottom-section">
          <span className="bottom-section-title">{UI.PINJAMAN}</span>
          <div className="bottom-cards-scroll">
            {pendingLoanRequests.length === 0 ? (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '12px 0' }}>Tidak ada pengajuan pinjaman</span>
            ) : (
              pendingLoanRequests.map((loan) => (
                <div key={loan.id} className="bottom-card" onClick={() => handleSelectLoan(loan)}>
                  <img src={loan.avatar} alt={loan.namaAnggota} className="bottom-card-avatar" />
                  <div className="bottom-card-info">
                    <span className="bottom-card-name">{loan.namaAnggota}</span>
                    <span className="bottom-card-subtitle">{formatRupiah(loan.jumlahPinjaman)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Members */}
        <div className="bottom-section">
          <span className="bottom-section-title">{UI.PENDAFTARAN_ANGGOTA}</span>
          <div className="bottom-cards-scroll">
            {pendingApplications.length === 0 ? (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '12px 0' }}>Tidak ada pendaftaran baru</span>
            ) : (
              pendingApplications.map((npc) => (
                <div key={npc.id} className="bottom-card" onClick={() => handleSelectNpc(npc)}>
                  <img src={npc.avatar} alt={npc.name} className="bottom-card-avatar" />
                  <div className="bottom-card-info">
                    <span className="bottom-card-name">{npc.name}</span>
                    <span className="bottom-card-subtitle">{npc.pekerjaan}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 3: Calendar Mini + Active Loans button */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="bottom-card calendar-pill" onClick={() => setActiveModal('kalender')}>
            <span className="calendar-month">{monthName.substring(0, 3)}</span>
            <span className="calendar-day">{dateObj.date()}</span>
            <span className="calendar-year">{dateObj.year()}</span>
          </div>
          <button 
            className="sidebar-btn" 
            style={{ width: '100%', height: '100%' }}
            onClick={() => setActiveModal('pinjamanAktifList')}
          >
            <span style={{ fontSize: '20px' }}>👥</span>
            <span style={{ fontSize: '10px' }}>Pinjaman/Anggota</span>
          </button>
        </div>

        {/* Section 4: End Day button */}
        <button className="btn btn-primary btn-endday" onClick={endDay}>
          <span>⏭ {UI.AKHIRI_HARI}</span>
          <span className="endday-subtitle">Simulasikan Penjualan</span>
        </button>
      </div>

      {/* Conditionally Render HUD Modals */}
      {activeModal === 'anggotaDetail' && <PanelAnggota />}
      {activeModal === 'pinjamanDetail' && <PanelPinjaman />}
      {activeModal === 'pinjamanAktifList' && <PanelPinjaman />}
      {activeModal === 'pasar' && <PasarPasokan />}
      {activeModal === 'harga' && <KontrolHarga />}
      {activeModal === 'kalender' && <PanelKalender />}
      {activeModal === 'laporanHarian' && <LaporanHarian />}
      {activeModal === 'bagiHasil' && <BagiHasil />}
      {activeModal === 'museum' && <PanelMuseum />}

      {/* GameOver Screen overlay */}
      {activeModal === 'gameOver' && gameResult && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
          <div className="modal-content glass-card" style={{ maxWidth: '460px', textAlign: 'center', padding: '32px' }}>
            <h1 style={{ fontSize: '28px', color: gameResult.outcome === 'win' ? 'var(--accent-green)' : 'var(--accent-red)', marginBottom: '12px' }}>
              {gameResult.outcome === 'win' ? '🏆 SELAMAT! KAMU MENANG!' : '❌ PERMAINAN BERAKHIR'}
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '24px', lineHeight: '1.5' }}>
              {gameResult.reason}
            </p>

            <div className="glass-card" style={{ background: 'rgba(15,23,42,0.4)', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>Statistik Koperasi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sisa Saldo:</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-yellow)' }}>{formatRupiah(useGameStore.getState().money)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Jumlah Anggota:</span>
                  <span style={{ fontWeight: '700' }}>{useGameStore.getState().memberCount} orang</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tingkat Kebahagiaan:</span>
                  <span style={{ fontWeight: '700' }}>{useGameStore.getState().happiness}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Barang Terjual:</span>
                  <span style={{ fontWeight: '700' }}>{useGameStore.getState().statistics.totalItemsSold} unit</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pinjaman Disalurkan:</span>
                  <span style={{ fontWeight: '700' }}>{useGameStore.getState().statistics.totalLoansGiven} kali</span>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '16px' }} onClick={resetGame}>
              {UI.BTN_MAIN_LAGI}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
