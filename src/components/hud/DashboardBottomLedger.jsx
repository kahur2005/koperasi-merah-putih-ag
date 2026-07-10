import React from 'react';
import dayjs from 'dayjs';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { formatRupiah } from '../../utils/formatRupiah';

function getPersonName(person) {
  return person?.nama || person?.name || person?.memberName || person?.namaAnggota || 'Warga Desa';
}

export default function DashboardBottomLedger() {
  const currentDate = useGameStore((state) => state.currentDate);
  const gamePhase = useGameStore((state) => state.gamePhase);
  const pendingApplications = useGameStore((state) => state.pendingApplications);
  const pendingLoanRequests = useGameStore((state) => state.pendingLoanRequests);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const setSelectedNpc = useGameStore((state) => state.setSelectedNpc);
  const setSelectedLoan = useGameStore((state) => state.setSelectedLoan);
  const endDay = useGameStore((state) => state.endDay);
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

  return (
    <section className="dashboard-bottom-ledger bottom-bar glass-card" aria-label="Agenda koperasi">
      <div className="bottom-section ledger-loans">
        <span className="bottom-section-title">Pinjaman Baru</span>
        <div className="bottom-cards-scroll">
          {pendingLoanRequests.length === 0 ? <span className="empty-state">Tidak ada pengajuan pinjaman</span> : pendingLoanRequests.map((loan) => (
            <button key={loan.id} className="bottom-card" onClick={() => handleSelectLoan(loan)}>
              <img src={loan.avatar} alt={getPersonName(loan)} className="bottom-card-avatar" />
              <span className="bottom-card-info"><span className="bottom-card-name">{getPersonName(loan)}</span><span className="bottom-card-subtitle">{formatRupiah(loan.jumlahPinjaman)}</span></span>
            </button>
          ))}
        </div>
      </div>

      <div className="bottom-section ledger-members">
        <span className="bottom-section-title">Calon Anggota</span>
        <div className="bottom-cards-scroll">
          {pendingApplications.length === 0 ? <span className="empty-state">Tidak ada pendaftaran baru</span> : pendingApplications.map((npc) => (
            <button key={npc.id} className="bottom-card" onClick={() => handleSelectNpc(npc)}>
              <img src={npc.avatar} alt={getPersonName(npc)} className="bottom-card-avatar" />
              <span className="bottom-card-info"><span className="bottom-card-name">{getPersonName(npc)}</span><span className="bottom-card-subtitle">{npc.pekerjaan}</span></span>
            </button>
          ))}
        </div>
      </div>

      <div className="quick-actions dashboard-ledger-actions">
        <button className="bottom-card calendar-pill" onClick={() => setActiveModal('kalender')} aria-label="Buka kalender">
          <span className="calendar-month">{monthName.substring(0, 3)}</span><span className="calendar-day">{dateObj.date()}</span><span className="calendar-year">{dateObj.year()}</span>
        </button>
        <button className="sidebar-btn" onClick={() => setActiveModal('pinjamanAktifList')} title="Pinjaman dan anggota">
          <img src="/assets/images/icon_anggota.png" alt="" /><span>Pinjaman/Anggota</span>
        </button>
      </div>

      <button className="btn btn-primary btn-endday" onClick={endDay} disabled={gamePhase !== 'storeOpen'}>
        <span>{gamePhase === 'storeOpen' ? UI.AKHIRI_HARI : 'Toko Belum Dibuka'}</span>
        <span className="endday-subtitle">{gamePhase === 'storeOpen' ? 'Simulasikan Penjualan' : 'Selesaikan restok dulu'}</span>
      </button>
    </section>
  );
}
