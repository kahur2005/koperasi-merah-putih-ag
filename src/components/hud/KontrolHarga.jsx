import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { formatRupiah } from '../../utils/formatRupiah';

export default function KontrolHarga() {
  const sellingPrices = useGameStore((s) => s.sellingPrices);
  const purchasePrices = useGameStore((s) => s.purchasePrices);
  const setSellingPrice = useGameStore((s) => s.setSellingPrice);
  const setActiveModal = useGameStore((s) => s.setActiveModal);
  const addNotification = useGameStore((s) => s.addNotification);

  const [prices, setPrices] = useState({
    rice: sellingPrices.rice,
    cookingOil: sellingPrices.cookingOil,
    lpgGas: sellingPrices.lpgGas,
  });

  const handleClose = () => {
    setActiveModal(null);
  };

  const handlePriceChange = (item, val) => {
    const price = parseInt(val) || 0;
    setPrices((prev) => ({ ...prev, [item]: Math.max(0, price) }));
  };

  const handleSave = () => {
    setSellingPrice('rice', prices.rice);
    setSellingPrice('cookingOil', prices.cookingOil);
    setSellingPrice('lpgGas', prices.lpgGas);
    addNotification('Harga jual baru berhasil disimpan!');
    handleClose();
  };

  const items = [
    { key: 'rice', name: UI.BERAS },
    { key: 'cookingOil', name: UI.MINYAK_GORENG },
    { key: 'lpgGas', name: UI.GAS_LPG },
  ];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{UI.KONTROL_HARGA}</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {UI.ATUR_HARGA_JUAL}
        </p>

        <table className="data-table">
          <thead>
            <tr>
              <th>{UI.BARANG}</th>
              <th>Harga Modal (Rata-rata)</th>
              <th style={{ width: '150px' }}>{UI.HARGA_JUAL}</th>
              <th>{UI.MARKUP}</th>
              <th>Efek</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const pp = purchasePrices[item.key] || { lastPT: 15000, lastUMKM: 16000 };
              const avgCost = Math.round(((pp.lastPT || 0) + (pp.lastUMKM || 0)) / 2);
              const sellPrice = prices[item.key];
              const markup = avgCost > 0 ? Math.round(((sellPrice - avgCost) / avgCost) * 100) : 0;

              let effectText = '😐 Netral';
              let effectStyle = { color: 'var(--text-secondary)' };

              if (markup > 30) {
                effectText = '😡 Rakyat Kecewa';
                effectStyle = { color: 'var(--accent-red)', fontWeight: '600' };
              } else if (markup < 5) {
                effectText = '😊 Rakyat Senang';
                effectStyle = { color: 'var(--accent-green)', fontWeight: '600' };
              }

              return (
                <tr key={item.key}>
                  <td style={{ fontWeight: '600' }}>{item.name}</td>
                  <td>{formatRupiah(avgCost)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Rp</span>
                      <input 
                        type="number"
                        value={sellPrice || ''}
                        onChange={(e) => handlePriceChange(item.key, e.target.value)}
                        className="form-input"
                        style={{ padding: '6px' }}
                      />
                    </div>
                  </td>
                  <td style={{ fontWeight: '600', color: markup > 30 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                    {markup}%
                  </td>
                  <td style={effectStyle}>{effectText}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Info panel */}
        <div className="info-note">
          <ul style={{ listStyleType: 'disc', paddingLeft: '16px' }}>
            <li>Harga Modal didasarkan pada rata-rata harga beli terakhir dari PT & UMKM.</li>
            <li>Markup &gt; 30%: Menurunkan Kebahagiaan warga sebesar 1% setiap kali barang tersebut terjual.</li>
            <li>Markup &lt; 5%: Meningkatkan Kebahagiaan warga sebesar 0,5% setiap kali barang tersebut terjual.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={handleSave}>
            {UI.BTN_SIMPAN_HARGA}
          </button>
        </div>
      </div>
    </div>
  );
}
