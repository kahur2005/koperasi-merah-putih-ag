import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { formatRupiah } from '../../utils/formatRupiah';

export default function PanelPinjaman() {
  const activeModal = useGameStore((s) => s.activeModal);
  const selectedLoan = useGameStore((s) => s.selectedLoan);
  const activeLoans = useGameStore((s) => s.activeLoans);
  const members = useGameStore((s) => s.members);
  const money = useGameStore((s) => s.money);
  const approveLoan = useGameStore((s) => s.approveLoan);
  const denyLoan = useGameStore((s) => s.denyLoan);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setSelectedLoan = useGameStore((s) => s.setSelectedLoan);
  
  const getPersonName = (person) => person?.nama || person?.name || person?.memberName || person?.namaAnggota || 'Warga Desa';

  const handleClose = () => {
    setActiveModal(null);
    setSelectedLoan(null);
  };

  if (activeModal === 'pinjamanDetail' && selectedLoan) {
    // Live loan calculations (Fixed 6% PA -> 0.5% PM, Tenor fixed to 1 month)
    const pokokBulanan = selectedLoan.jumlahPinjaman;
    const bungaBulanan = Math.round(selectedLoan.jumlahPinjaman * 0.005);
    const totalBulanan = pokokBulanan + bungaBulanan;
    const totalBayar = totalBulanan;

    const handleApprove = () => {
      approveLoan(selectedLoan.id);
      handleClose();
    };

    const handleDeny = () => {
      denyLoan(selectedLoan.id);
      handleClose();
    };

    // Find the NPC avatar
    const avatar = selectedLoan.avatar || '/assets/avatars/male_1_budi.jpg';
    const loanName = getPersonName(selectedLoan);

    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{UI.PENGAJUAN_PINJAMAN}</h2>
            <button className="modal-close" onClick={handleClose}>&times;</button>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '12px 0' }}>
            <img 
              src={avatar} 
              alt={loanName} 
              style={{ width: '80px', height: '80px', borderRadius: '0', objectFit: 'cover', border: '3px solid var(--wood-dark)' }}
            />
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '2px' }}>{loanName}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{selectedLoan.pekerjaanAnggota || selectedLoan.pekerjaan || 'Anggota Koperasi'}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{UI.PENDAPATAN_BULANAN}: <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>{formatRupiah(selectedLoan.pendapatanBulanan)}</span></p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '12px 0', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{UI.JUMLAH_PINJAMAN}</span>
              <span style={{ fontWeight: '700', color: 'var(--accent-yellow)' }}>{formatRupiah(selectedLoan.jumlahPinjaman)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{UI.TUJUAN_PINJAMAN}</span>
              <span style={{ fontWeight: '500', maxWidth: '60%', textAlign: 'right' }}>{selectedLoan.tujuanPinjaman || selectedLoan.alasan}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{UI.TENOR}</span>
              <span style={{ fontWeight: '600' }}>1 {UI.BULAN}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{UI.BUNGA}</span>
              <span style={{ fontWeight: '700', color: 'var(--accent-orange)' }}>6% / Tahun</span>
            </div>
          </div>

          <div className="info-note" style={{ fontSize: '11px', borderLeft: '8px solid var(--accent-orange)' }}>
            <span style={{ fontWeight: '700' }}>{UI.EFEK}: </span>
            <span style={{ color: 'var(--accent-green)' }}>Menambah pasokan UMKM +5 dan menurunkan harga 2% saat pinjaman lunas.</span>
          </div>

          {/* Payment calculation breakdown */}
          <div className="glass-card" style={{ marginBottom: '16px', padding: '12px' }}>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>{UI.PERHITUNGAN_CICILAN}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{UI.POKOK_PER_BULAN}</span>
                <span>{formatRupiah(pokokBulanan)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{UI.BUNGA_PER_BULAN}</span>
                <span>{formatRupiah(bungaBulanan)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '6px', fontWeight: '700' }}>
                <span>{UI.TOTAL_PER_BULAN}</span>
                <span style={{ color: 'var(--text-primary)' }}>{formatRupiah(totalBulanan)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>{UI.TOTAL_BAYAR}</span>
                <span>{formatRupiah(totalBayar)}</span>
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleDeny}>
              {UI.BTN_TOLAK}
            </button>
            <button 
              className="btn btn-success" 
              style={{ flex: 1 }} 
              onClick={handleApprove}
              disabled={money < selectedLoan.jumlahPinjaman}
            >
              {money < selectedLoan.jumlahPinjaman ? 'Saldo Tidak Cukup' : UI.BTN_SETUJUI}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeModal === 'pinjamanAktifList') {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content glass-card" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{UI.PINJAMAN_AKTIF} & {UI.ANGGOTA}</h2>
            <button className="modal-close" onClick={handleClose}>&times;</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* List of members */}
            <div>
              <h3 style={{ fontSize: '15px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Daftar Anggota Koperasi ({members.length})</h3>
              {members.length === 0 ? (
                <div className="info-note" style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Koperasi belum memiliki anggota. Terima anggota baru di Bottom Bar!
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {members.map((m) => (
                    <div key={m.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', flex: '1 0 200px' }}>
                      <img src={m.avatar} alt={m.name} style={{ width: '28px', height: '28px', borderRadius: '0', objectFit: 'cover', border: '3px solid var(--wood-dark)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>{getPersonName(m)}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{m.pekerjaan}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active loans */}
            <div>
              <h3 style={{ fontSize: '15px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Pinjaman Aktif ({activeLoans.filter(l => l.status === 'aktif').length})</h3>
              {activeLoans.filter(l => l.status === 'aktif').length === 0 ? (
                <div className="info-note" style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Tidak ada pinjaman aktif saat ini.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                  {activeLoans.filter(l => l.status === 'aktif').map((l) => {
                    const progressPercent = Math.round(((l.tenorBulan - l.sisaBulan) / l.tenorBulan) * 100);
                    return (
                      <div key={l.id} className="glass-card" style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700' }}>{getPersonName(l)}</span>
                          <span style={{ fontSize: '11px', color: 'var(--accent-orange)' }}>Sisa {l.sisaBulan} dari {l.tenorBulan} bulan</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <span>Jumlah: {formatRupiah(l.jumlahPinjaman)} (Bunga {l.bungaPersen}%)</span>
                          <span>Cicilan: {formatRupiah(l.cicilanPerBulan)}/bln</span>
                        </div>
                        {/* Progress bar */}
                        <div style={{ width: '100%', height: '8px', background: '#e3d4bd', borderRadius: '0', overflow: 'hidden' }}>
                          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-blue)', transition: 'width 0.3s ease' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
