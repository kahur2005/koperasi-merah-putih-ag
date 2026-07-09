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
import AdvisoryMemo from '../hud/AdvisoryMemo';
import ChapterProgress from '../hud/ChapterProgress';
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

  const handleSelectNpc = (npc) => {
    setSelectedNpc(npc);
    setActiveModal('anggotaDetail');
  };

  const handleSelectLoan = (loan) => {
    setSelectedLoan(loan);
    setActiveModal('pinjamanDetail');
  };

  const getPersonName = (person) => person?.nama || person?.name || person?.memberName || person?.namaAnggota || 'Warga Desa';

  return (
    <div 
      className="dashboard"
    >
      <TopBar />

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

      <nav className="right-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }} aria-label="Menu utama">
        <button className="retro-image-btn" onClick={() => setActiveModal('museum')} title={UI.MUSEUM}>
          <img src="/assets/images/ui/btn_museum.png" alt="Museum" style={{ width: '90px' }} />
        </button>
        <button className="retro-image-btn" onClick={() => setActiveModal('pasar')} title={UI.PASAR}>
          <img src="/assets/images/ui/btn_pasar.png" alt="Pasar" style={{ width: '90px' }} />
        </button>
        <button className="retro-image-btn" onClick={() => setActiveModal('harga')} title={UI.HARGA}>
          <img src="/assets/images/ui/btn_harga.png" alt="Harga" style={{ width: '90px' }} />
        </button>
      </nav>

      <div className="center-building-area">
        <div className="store-entry-panel" aria-label="Status toko koperasi">
          <button className="btn btn-primary btn-masuk" onClick={() => setView('store3d')}>
            Masuk Toko
          </button>
        </div>
      </div>

      <ChapterProgress />
      <AdvisoryMemo />

      <div className="bottom-bar glass-card">
        <div className="bottom-section">
          <span className="bottom-section-title">{UI.PINJAMAN}</span>
          <div className="bottom-cards-scroll">
            {pendingLoanRequests.length === 0 ? (
              <span className="empty-state">Tidak ada pengajuan pinjaman</span>
            ) : (
              pendingLoanRequests.map((loan) => (
                <button key={loan.id} className="bottom-card" onClick={() => handleSelectLoan(loan)}>
                  <img src={loan.avatar} alt={loan.namaAnggota} className="bottom-card-avatar" />
                  <div className="bottom-card-info">
                    <span className="bottom-card-name">{getPersonName(loan)}</span>
                    <span className="bottom-card-subtitle">{formatRupiah(loan.jumlahPinjaman)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bottom-section">
          <span className="bottom-section-title">{UI.PENDAFTARAN_ANGGOTA}</span>
          <div className="bottom-cards-scroll">
            {pendingApplications.length === 0 ? (
              <span className="empty-state">Tidak ada pendaftaran baru</span>
            ) : (
              pendingApplications.map((npc) => (
                <button key={npc.id} className="bottom-card" onClick={() => handleSelectNpc(npc)}>
                  <img src={npc.avatar} alt={npc.name} className="bottom-card-avatar" />
                  <div className="bottom-card-info">
                    <span className="bottom-card-name">{getPersonName(npc)}</span>
                    <span className="bottom-card-subtitle">{npc.pekerjaan}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="quick-actions">
          <button className="bottom-card calendar-pill" onClick={() => setActiveModal('kalender')}>
            <span className="calendar-month">{monthName.substring(0, 3)}</span>
            <span className="calendar-day">{dateObj.date()}</span>
            <span className="calendar-year">{dateObj.year()}</span>
          </button>
          <button 
            className="sidebar-btn" 
            onClick={() => setActiveModal('pinjamanAktifList')}
            title="Pinjaman dan anggota"
          >
            <span style={{ fontSize: '20px' }}>👥</span>
            <span style={{ fontSize: '10px' }}>Pinjaman/Anggota</span>
          </button>
        </div>

        <button className="btn btn-primary btn-endday" onClick={endDay}>
          <span>{UI.AKHIRI_HARI}</span>
          <span className="endday-subtitle">Simulasikan Penjualan</span>
        </button>
      </div>

      {activeModal === 'anggotaDetail' && <PanelAnggota />}
      {activeModal === 'pinjamanDetail' && <PanelPinjaman />}
      {activeModal === 'pinjamanAktifList' && <PanelPinjaman />}
      {activeModal === 'pasar' && <PasarPasokan />}
      {activeModal === 'harga' && <KontrolHarga />}
      {activeModal === 'kalender' && <PanelKalender />}
      {activeModal === 'laporanHarian' && <LaporanHarian />}
      {activeModal === 'bagiHasil' && <BagiHasil />}
      {activeModal === 'museum' && <PanelMuseum />}

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
