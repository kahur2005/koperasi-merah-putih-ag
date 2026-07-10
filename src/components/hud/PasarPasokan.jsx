import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { UI } from '../../constants/uiStrings';
import { SUPPLIERS } from '../../constants/gameConstants';
import { formatRupiah } from '../../utils/formatRupiah';

export default function PasarPasokan() {
  const money = useGameStore((s) => s.money);
  const stock = useGameStore((s) => s.stock);
  const stockCapacity = useGameStore((s) => s.stockCapacity);
  const supplierStockPT = useGameStore((s) => s.supplierStockPT);
  const supplierStockUMKM = useGameStore((s) => s.supplierStockUMKM);
  const supplierPricesUMKM = useGameStore((s) => s.supplierPricesUMKM);
  const buySupply = useGameStore((s) => s.buySupply);
  const setActiveModal = useGameStore((s) => s.setActiveModal);

  const [activeTab, setActiveTab] = useState('PT'); // 'PT' or 'UMKM'
  const [quantities, setQuantities] = useState({ rice: 0, cookingOil: 0, lpgGas: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  const handleClose = () => {
    setActiveModal(null);
  };

  const handleQtyChange = (item, val) => {
    const qty = parseInt(val) || 0;
    setQuantities((prev) => ({ ...prev, [item]: Math.max(0, qty) }));
    setErrorMsg('');
  };

  const handleBuy = (item) => {
    const qty = quantities[item];
    if (qty <= 0) return;

    const isPT = activeTab === 'PT';
    const supplierStock = isPT ? supplierStockPT : supplierStockUMKM;
    const prices = isPT ? SUPPLIERS.PT.prices : supplierPricesUMKM;
    const unitPrice = prices[item];
    const totalCost = unitPrice * qty;

    // Check availability
    const spaceAvailable = stockCapacity[item] - stock[item];
    if (qty > spaceAvailable) {
      setErrorMsg('Gagal: Kapasitas gudang koperasi tidak cukup!');
      return;
    }
    if (totalCost > money) {
      setErrorMsg('Gagal: Saldo kas koperasi tidak mencukupi!');
      return;
    }
    if (qty > supplierStock[item]) {
      setErrorMsg('Gagal: Stok pemasok tidak mencukupi!');
      return;
    }

    // Call store action
    buySupply(activeTab, item, qty);
    
    // Reset quantity
    setQuantities((prev) => ({ ...prev, [item]: 0 }));
    setErrorMsg('');
  };

  const isPT = activeTab === 'PT';
  const supplierStock = isPT ? supplierStockPT : supplierStockUMKM;
  const prices = isPT ? SUPPLIERS.PT.prices : supplierPricesUMKM;

  const items = [
    { key: 'rice', name: UI.BERAS },
    { key: 'cookingOil', name: UI.MINYAK_GORENG },
    { key: 'lpgGas', name: UI.GAS_LPG },
  ];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content glass-card modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{UI.PASAR_PASOKAN}</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        {/* Supplier Tabs */}
        <div className="tab-row">
          <button
            className={`tab-btn tab-pt ${activeTab === 'PT' ? 'active' : ''}`}
            onClick={() => { setActiveTab('PT'); setErrorMsg(''); }}
          >
            🏢 {UI.PEMASOK_PT}
          </button>
          <button
            className={`tab-btn tab-umkm ${activeTab === 'UMKM' ? 'active' : ''}`}
            onClick={() => { setActiveTab('UMKM'); setErrorMsg(''); }}
          >
            🌾 {UI.PEMASOK_UMKM}
          </button>
        </div>

        {/* Warning about happiness */}
        <div className={`info-note ${isPT ? 'warn' : 'good'}`}>
          {isPT ? (
            <span>⚠️ Pembelian dari PT menghemat biaya tapi menurunkan Kebahagiaan warga (-2% per transaksi).</span>
          ) : (
            <span>☘️ Pembelian dari UMKM Desa meningkatkan Kebahagiaan warga (+2% per transaksi) & mendukung ekonomi lokal!</span>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="info-note error">
            {errorMsg}
          </div>
        )}

        {/* Purchase Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th>{UI.BARANG}</th>
              <th>{UI.HARGA_LABEL}</th>
              <th>{UI.STOK}</th>
              <th>Koperasi</th>
              <th style={{ width: '120px' }}>{UI.JUMLAH}</th>
              <th style={{ width: '80px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const currentStock = stock[item.key];
              const cap = stockCapacity[item.key];
              const price = prices[item.key];
              const avail = supplierStock[item.key];
              const qty = quantities[item.key];
              const cost = price * qty;

              return (
                <tr key={item.key}>
                  <td style={{ fontWeight: '600' }}>{item.name}</td>
                  <td style={{ color: 'var(--accent-yellow)', fontWeight: '600' }}>{formatRupiah(price)}</td>
                  <td>{avail} unit</td>
                  <td>{currentStock}/{cap}</td>
                  <td>
                    <input 
                      type="number" 
                      min="0"
                      max={avail}
                      value={qty || ''}
                      onChange={(e) => handleQtyChange(item.key, e.target.value)}
                      className="form-input"
                      style={{ padding: '8px', textAlign: 'center' }}
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-success" 
                      style={{ padding: '6px 12px', fontSize: '16px' }}
                      disabled={qty <= 0 || qty > avail}
                      onClick={() => handleBuy(item.key)}
                    >
                      {UI.BTN_BELI}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Live Total Cost Preview */}
        <div className="modal-footer-row">
          <div>
            <span>Saldo Kas Koperasi: </span>
            <span>{formatRupiah(money)}</span>
          </div>
          {Object.values(quantities).some(q => q > 0) && (
            <div style={{ textAlign: 'right' }}>
              <span>Estimasi Total: </span>
              <span>
                {formatRupiah(items.reduce((acc, it) => acc + (prices[it.key] * quantities[it.key]), 0))}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
