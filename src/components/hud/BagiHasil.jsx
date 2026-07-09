import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { MEMBERS } from '../../constants/gameConstants';
import { formatRupiah } from '../../utils/formatRupiah';

export default function BagiHasil() {
  const memberCount = useGameStore((s) => s.memberCount);
  const money = useGameStore((s) => s.money);
  const processBagiHasil = useGameStore((s) => s.processBagiHasil);
  const startNewDay = useGameStore((s) => s.startNewDay);

  const [percent, setPercent] = useState(5); // Default 5%

  const monthlySaving = MEMBERS.MONTHLY_SAVING || 50000;
  const perMemberPayout = Math.round((percent / 100) * monthlySaving);
  const totalCost = perMemberPayout * memberCount;

  // Happiness effect calculation
  let happinessEffectText = '';
  let happinessEffectColor = '';

  if (percent === 0) {
    happinessEffectText = '-10% Kebahagiaan (Warga sangat kecewa)';
    happinessEffectColor = 'var(--accent-red)';
  } else {
    happinessEffectText = `+${percent}% Kebahagiaan (Warga senang)`;
    happinessEffectColor = 'var(--accent-green)';
  }

  const handleConfirm = () => {
    processBagiHasil(percent);
    // After Bagi Hasil is completed, call startNewDay to advance to next day
    startNewDay();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ maxWidth: '440px', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800' }}>💰 {UI.BAGI_HASIL}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            {UI.BAGI_HASIL_DESC}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', margin: '16px 0' }}>
          <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{UI.ANGGOTA}:</span>
            <span style={{ fontWeight: '600' }}>{memberCount} orang</span>
          </div>
          <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tabungan Pokok/bulan:</span>
            <span style={{ fontWeight: '600' }}>{formatRupiah(monthlySaving)}</span>
          </div>

          {/* Distribution slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700' }}>{UI.PERSEN_BAGI_HASIL}:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={percent} 
                  onChange={(e) => setPercent(parseInt(e.target.value))} 
                  style={{ width: '120px' }}
                />
                <span style={{ fontWeight: '800', color: 'var(--accent-yellow)', width: '28px', textAlign: 'right' }}>{percent}%</span>
              </div>
            </div>
          </div>

          {/* Breakdown calculation */}
          <div className="glass-card" style={{ padding: '12px', margin: '8px 0' }}>
            <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>Preview Pembayaran</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{UI.PER_ANGGOTA}</span>
                <span style={{ fontWeight: '600' }}>{formatRupiah(perMemberPayout)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '6px' }}>
                <span>{UI.TOTAL_BIAYA}</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-red)' }}>{formatRupiah(totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Happiness effect */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
            <span>{UI.EFEK_KEBAHAGIAAN}:</span>
            <span style={{ fontWeight: '700', color: happinessEffectColor }}>{happinessEffectText}</span>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '12px', marginTop: '16px' }} 
          onClick={handleConfirm}
          disabled={money < totalCost}
        >
          {money < totalCost ? 'Saldo Kas Tidak Cukup' : UI.BTN_KONFIRMASI}
        </button>
      </div>
    </div>
  );
}
