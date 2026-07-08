import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { formatRupiah } from '../../utils/formatRupiah';

export default function PanelAnggota() {
  const selectedNpc = useGameStore((s) => s.selectedNpc);
  const acceptMember = useGameStore((s) => s.acceptMember);
  const denyMember = useGameStore((s) => s.denyMember);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const setSelectedNpc = useGameStore((s) => s.setSelectedNpc);

  if (!selectedNpc) return null;

  const handleClose = () => {
    setActiveModal(null);
    setSelectedNpc(null);
  };

  const handleAccept = () => {
    acceptMember(selectedNpc.id);
    handleClose();
  };

  const handleDeny = () => {
    denyMember(selectedNpc.id);
    handleClose();
  };

  const personName = selectedNpc.nama || selectedNpc.name || 'Warga Desa';

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{UI.PROFIL_ANGGOTA}</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '16px 0' }}>
          <img 
            src={selectedNpc.avatar} 
            alt={personName} 
            style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-yellow)' }} 
          />
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{personName}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{selectedNpc.pekerjaan}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{UI.UMUR}</span>
            <span style={{ fontWeight: '600' }}>{selectedNpc.umur} {UI.TAHUN}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{UI.JENIS_KELAMIN}</span>
            <span style={{ fontWeight: '600' }}>{selectedNpc.jenisKelamin === 'Laki-laki' ? UI.LAKI_LAKI : UI.PEREMPUAN}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{UI.PENDAPATAN_BULANAN}</span>
            <span style={{ fontWeight: '600', color: 'var(--accent-green)' }}>{formatRupiah(selectedNpc.pendapatanBulanan)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{UI.SIMPANAN_WAJIB}</span>
            <span style={{ fontWeight: '600', color: 'var(--accent-yellow)' }}>{formatRupiah(selectedNpc.simpananWajib)} {UI.PER_BULAN}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleDeny}>
            {UI.BTN_TOLAK}
          </button>
          <button className="btn btn-success" style={{ flex: 1 }} onClick={handleAccept}>
            {UI.BTN_TERIMA}
          </button>
        </div>
      </div>
    </div>
  );
}
