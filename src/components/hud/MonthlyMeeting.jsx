import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { formatRupiah } from '../../utils/formatRupiah';

const OPTIONS = [
  {
    key: 'low',
    label: 'Rendah',
    amount: 25_000,
    effect: '+5% kebahagiaan, ruang pinjaman lebih kecil',
  },
  {
    key: 'normal',
    label: 'Normal',
    amount: 50_000,
    effect: 'Seimbang, tanpa gejolak anggota',
  },
  {
    key: 'high',
    label: 'Tinggi',
    amount: 100_000,
    effect: '-10% kebahagiaan, sebagian anggota bisa keluar',
  },
];

export default function MonthlyMeeting() {
  const memberCount = useGameStore((s) => s.memberCount);
  const chooseMonthlyPayment = useGameStore((s) => s.chooseMonthlyPayment);

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card monthly-meeting">
        <div className="modal-header">
          <h2>Rapat Simpanan Bulanan</h2>
        </div>

        <p className="meeting-copy">
          Anggota koperasi berkumpul untuk menentukan simpanan wajib bulan ini.
          Pilihan ini memengaruhi kas, ruang pinjaman, dan kebahagiaan anggota.
        </p>

        <div className="monthly-options">
          {OPTIONS.map((option) => (
            <button
              key={option.key}
              className="monthly-option"
              onClick={() => chooseMonthlyPayment(option.key)}
            >
              <span>{option.label}</span>
              <strong>{formatRupiah(option.amount)} / anggota</strong>
              <small>{formatRupiah(option.amount * memberCount)} total</small>
              <em>{option.effect}</em>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
