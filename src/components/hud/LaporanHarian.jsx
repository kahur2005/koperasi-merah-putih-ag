import React from 'react';
import dayjs from 'dayjs';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { formatRupiah } from '../../utils/formatRupiah';

export default function LaporanHarian() {
  const dayReport = useGameStore((s) => s.dayReport);
  const sellingPrices = useGameStore((s) => s.sellingPrices);
  const startNewDay = useGameStore((s) => s.startNewDay);

  if (!dayReport) return null;

  const handleNextDay = () => {
    startNewDay();
  };

  const current = dayjs(dayReport.date);
  const indonesianDateStr = `${current.date()} ${UI.BULAN_NAMES[current.month()]} ${current.year()}`;

  // Calculate disappointed customers
  const totalCustomers = dayReport.totalCustomers;
  const itemsSold = dayReport.totalItemsSold;
  const disappointedCustomers = Math.max(0, totalCustomers - itemsSold);

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ maxWidth: '440px', padding: '31px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '31px', fontWeight: '800', letterSpacing: '0.5px' }}>📋 {UI.LAPORAN_HARIAN}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', marginTop: '4px' }}>
            {UI.HARI} {dayReport.dayNumber} &bull; {indonesianDateStr}
          </p>
        </div>

        <div style={{ borderTop: '2px dashed var(--border)', borderBottom: '2px dashed var(--border)', padding: '16px 0', margin: '16px 0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {UI.BARANG_TERJUAL}:
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {/* Rice */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
              <span>🍚 {UI.BERAS}</span>
              <span style={{ fontWeight: '600' }}>
                {dayReport.salesBreakdown.rice.sold} &times; {formatRupiah(sellingPrices.rice)} = {formatRupiah(dayReport.salesBreakdown.rice.revenue)}
              </span>
            </div>

            {/* Oil */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
              <span>🛢 {UI.MINYAK_GORENG}</span>
              <span style={{ fontWeight: '600' }}>
                {dayReport.salesBreakdown.cookingOil.sold} &times; {formatRupiah(sellingPrices.cookingOil)} = {formatRupiah(dayReport.salesBreakdown.cookingOil.revenue)}
              </span>
            </div>

            {/* Gas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
              <span>⛽ {UI.GAS_LPG}</span>
              <span style={{ fontWeight: '600' }}>
                {dayReport.salesBreakdown.lpgGas.sold} &times; {formatRupiah(sellingPrices.lpgGas)} = {formatRupiah(dayReport.salesBreakdown.lpgGas.revenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '17px', margin: '16px 0' }}>
          {dayReport.playMode === 'manager' && dayReport.manager && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mode:</span>
                <span style={{ fontWeight: '600' }}>Manager 3D</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Klik salah:</span>
                <span style={{ fontWeight: '600' }}>{dayReport.manager.wrong}</span>
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{UI.PELANGGAN_DILAYANI}:</span>
            <span style={{ fontWeight: '600' }}>{itemsSold} / {totalCustomers}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{UI.PELANGGAN_KECEWA}:</span>
            <span style={{ fontWeight: '600', color: disappointedCustomers > 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
              {disappointedCustomers}
            </span>
          </div>
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px', margin: '16px 0 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', fontSize: '20px' }}>{UI.TOTAL_PENDAPATAN}:</span>
            <span style={{ fontWeight: '800', fontSize: '23px', color: 'var(--accent-green)' }}>
              {formatRupiah(dayReport.revenue)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', fontSize: '18px' }}>{UI.PERUBAHAN_KEBAHAGIAAN}:</span>
            <span 
              style={{ 
                fontWeight: '800', 
                fontSize: '20px', 
                color: dayReport.happinessChange >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' 
              }}
            >
              {dayReport.happinessChange >= 0 ? '+' : ''}{dayReport.happinessChange}%
            </span>
          </div>
        </div>

        <button className="btn btn-primary btn-endday" style={{ width: '100%', padding: '16px' }} onClick={handleNextDay}>
          Lanjut ke Restok Pasokan
        </button>
      </div>
    </div>
  );
}
