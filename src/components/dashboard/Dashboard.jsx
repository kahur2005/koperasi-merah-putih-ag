import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { formatRupiah } from '../../utils/formatRupiah';
import TopBar from '../hud/TopBar';
import MissionLedger from '../hud/MissionLedger';
import DashboardBottomLedger from '../hud/DashboardBottomLedger';
import PanelAnggota from '../hud/PanelAnggota';
import PanelPinjaman from '../hud/PanelPinjaman';
import PasarPasokan from '../hud/PasarPasokan';
import KontrolHarga from '../hud/KontrolHarga';
import PanelKalender from '../hud/PanelKalender';
import LaporanHarian from '../hud/LaporanHarian';
import BagiHasil from '../hud/BagiHasil';
import PanelMuseum from '../hud/PanelMuseum';

export default function Dashboard() {
  const activeModal = useGameStore((s) => s.activeModal);
  const activeEvents = useGameStore((s) => s.activeEvents);
  const setView = useGameStore((s) => s.setView);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const resetGame = useGameStore((s) => s.resetGame);
  const gameResult = useGameStore((s) => s.gameResult);

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

      <nav className="right-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '21px', alignItems: 'center' }} aria-label="Menu utama">
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


      <MissionLedger />
      <button className="dashboard-store-hotspot" onClick={() => setView('store3d')} aria-label="Masuk Toko" />
      <DashboardBottomLedger />

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
        <div className="modal-overlay" style={{ background: 'rgba(36, 26, 16, 0.95)' }}>
          <div className="modal-content glass-card" style={{ maxWidth: '460px', textAlign: 'center', padding: '42px' }}>
            <h1 style={{ fontSize: '36px', color: gameResult.outcome === 'win' ? 'var(--accent-green)' : 'var(--accent-red)', marginBottom: '12px' }}>
              {gameResult.outcome === 'win' ? '🏆 SELAMAT! KAMU MENANG!' : '❌ PERMAINAN BERAKHIR'}
            </h1>
            <p style={{ fontSize: '20px', color: 'var(--text-primary)', marginBottom: '24px', lineHeight: '1.5' }}>
              {gameResult.reason}
            </p>

            <div className="glass-card" style={{ background: 'var(--paper-2)', border: '3px solid var(--wood-dark)', padding: '21px', marginBottom: '24px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '17px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>Statistik Koperasi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '17px' }}>
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

            <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '21px' }} onClick={resetGame}>
              {UI.BTN_MAIN_LAGI}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
